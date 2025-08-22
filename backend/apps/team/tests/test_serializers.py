from django.test import TestCase, RequestFactory
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory
from apps.team.models import Team, TeamMembership
from apps.team.serializers import (
    TeamMemberSerializer,
    TeamListSerializer,
    TeamDetailSerializer,
    CreateTeamSerializer
)


class TeamMemberSerializerTest(TestCase):
    """TeamMemberSerializer tests"""

    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.team = Team.objects.create(name='Test Team')
        self.membership = TeamMembership.objects.create(
            user=self.user,
            team=self.team,
            role='owner'
        )

    def test_serializer_fields(self):
        """Test serializer includes correct fields"""
        serializer = TeamMemberSerializer(instance=self.membership)
        data = serializer.data
        
        expected_fields = {'id', 'username', 'email', 'role', 'joined_at', 'last_active'}
        self.assertEqual(set(data.keys()), expected_fields)

    def test_user_data_from_related_object(self):
        """Test username and email are pulled from related User object"""
        serializer = TeamMemberSerializer(instance=self.membership)
        data = serializer.data
        
        self.assertEqual(data['username'], self.user.username)
        self.assertEqual(data['email'], self.user.email)
        self.assertEqual(data['role'], 'owner')

    def test_read_only_fields(self):
        """Test read-only fields cannot be updated"""
        serializer = TeamMemberSerializer()
        read_only_fields = serializer.Meta.read_only_fields
        
        expected_read_only = ['id', 'joined_at', 'last_active']
        self.assertEqual(read_only_fields, expected_read_only)


class TeamListSerializerTest(TestCase):
    """TeamListSerializer tests"""

    def setUp(self):
        """Set up test data"""
        self.factory = APIRequestFactory()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.team = Team.objects.create(name='Test Team', max_members=10)
        self.membership = TeamMembership.objects.create(
            user=self.user,
            team=self.team,
            role='owner'
        )

    def test_serializer_fields(self):
        """Test serializer includes correct fields"""
        request = self.factory.get('/')
        request.user = self.user
        
        serializer = TeamListSerializer(
            instance=self.team,
            context={'request': request}
        )
        data = serializer.data
        
        expected_fields = {'id', 'name', 'member_count', 'max_members', 'created_at', 'role'}
        self.assertEqual(set(data.keys()), expected_fields)

    def test_member_count_field(self):
        """Test member_count field returns correct count"""
        request = self.factory.get('/')
        request.user = self.user
        
        serializer = TeamListSerializer(
            instance=self.team,
            context={'request': request}
        )
        data = serializer.data
        
        self.assertEqual(data['member_count'], 1)

    def test_get_role_with_authenticated_user(self):
        """Test get_role returns correct role for authenticated user"""
        request = self.factory.get('/')
        request.user = self.user
        
        serializer = TeamListSerializer(
            instance=self.team,
            context={'request': request}
        )
        data = serializer.data
        
        self.assertEqual(data['role'], 'owner')

    def test_get_role_without_membership(self):
        """Test get_role returns None for user not in team"""
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        
        request = self.factory.get('/')
        request.user = other_user
        
        serializer = TeamListSerializer(
            instance=self.team,
            context={'request': request}
        )
        data = serializer.data
        
        self.assertIsNone(data['role'])

    def test_get_role_without_request_context(self):
        """Test get_role returns None without request context"""
        serializer = TeamListSerializer(instance=self.team)
        data = serializer.data
        
        self.assertIsNone(data['role'])

    def test_get_role_with_unauthenticated_user(self):
        """Test get_role returns None for unauthenticated user"""
        request = self.factory.get('/')
        request.user = None  # Unauthenticated
        
        serializer = TeamListSerializer(
            instance=self.team,
            context={'request': request}
        )
        data = serializer.data
        
        self.assertIsNone(data['role'])


class TeamDetailSerializerTest(TestCase):
    """TeamDetailSerializer tests"""

    def setUp(self):
        """Set up test data"""
        self.factory = APIRequestFactory()
        self.user1 = User.objects.create_user(
            username='owner',
            email='owner@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='member',
            email='member@example.com',
            password='testpass123'
        )
        self.team = Team.objects.create(name='Detail Test Team')
        
        self.owner_membership = TeamMembership.objects.create(
            user=self.user1,
            team=self.team,
            role='owner'
        )
        self.member_membership = TeamMembership.objects.create(
            user=self.user2,
            team=self.team,
            role='view'
        )

    def test_serializer_includes_members(self):
        """Test serializer includes members list"""
        request = self.factory.get('/')
        request.user = self.user1
        
        serializer = TeamDetailSerializer(
            instance=self.team,
            context={'request': request}
        )
        data = serializer.data
        
        expected_fields = {'id', 'name', 'member_count', 'max_members', 'created_at', 'role', 'members'}
        self.assertEqual(set(data.keys()), expected_fields)
        
        # Check members data
        self.assertEqual(len(data['members']), 2)
        member_usernames = {member['username'] for member in data['members']}
        self.assertEqual(member_usernames, {'owner', 'member'})

    def test_members_serialization(self):
        """Test members are properly serialized"""
        request = self.factory.get('/')
        request.user = self.user1
        
        serializer = TeamDetailSerializer(
            instance=self.team,
            context={'request': request}
        )
        data = serializer.data
        
        # Find owner in members list
        owner_data = next(
            (member for member in data['members'] if member['username'] == 'owner'),
            None
        )
        
        self.assertIsNotNone(owner_data)
        self.assertEqual(owner_data['role'], 'owner')
        self.assertEqual(owner_data['email'], 'owner@example.com')


class CreateTeamSerializerTest(TestCase):
    """CreateTeamSerializer tests"""

    def setUp(self):
        """Set up test data"""
        self.factory = APIRequestFactory()
        self.user = User.objects.create_user(
            username='creator',
            email='creator@example.com',
            password='testpass123'
        )

    def test_serializer_fields(self):
        """Test serializer includes correct fields"""
        team = Team.objects.create(name='Created Team')
        request = self.factory.post('/')
        request.user = self.user
        
        serializer = CreateTeamSerializer(
            instance=team,
            context={'request': request}
        )
        data = serializer.data
        
        expected_fields = {'id', 'name', 'max_members', 'member_count', 'role', 'created_at'}
        self.assertEqual(set(data.keys()), expected_fields)

    def test_create_team_with_owner(self):
        """Test creating team automatically sets creator as owner"""
        request = self.factory.post('/')
        request.user = self.user
        
        serializer = CreateTeamSerializer(
            data={'name': 'New Team', 'max_members': 15},
            context={'request': request}
        )
        
        self.assertTrue(serializer.is_valid())
        team = serializer.save()
        
        # Check team was created
        self.assertEqual(team.name, 'New Team')
        self.assertEqual(team.max_members, 15)
        
        # Check creator is owner
        membership = TeamMembership.objects.filter(
            user=self.user,
            team=team,
            role='owner'
        ).first()
        
        self.assertIsNotNone(membership)

    def test_create_without_authenticated_user(self):
        """Test creating team without authenticated user"""
        request = self.factory.post('/')
        request.user = None
        
        serializer = CreateTeamSerializer(
            data={'name': 'New Team', 'max_members': 10},
            context={'request': request}
        )
        
        self.assertTrue(serializer.is_valid())
        team = serializer.save()
        
        # Team should be created but no membership
        self.assertEqual(team.name, 'New Team')
        membership_count = TeamMembership.objects.filter(team=team).count()
        self.assertEqual(membership_count, 0)

    def test_create_team_validation(self):
        """Test team creation validation"""
        request = self.factory.post('/')
        request.user = self.user
        
        # Test invalid data
        serializer = CreateTeamSerializer(
            data={'name': '', 'max_members': -1},
            context={'request': request}
        )
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('name', serializer.errors)

    def test_get_role_after_creation(self):
        """Test get_role returns owner after team creation"""
        request = self.factory.post('/')
        request.user = self.user
        
        serializer = CreateTeamSerializer(
            data={'name': 'Role Test Team', 'max_members': 10},
            context={'request': request}
        )
        
        self.assertTrue(serializer.is_valid())
        team = serializer.save()
        
        # Serialize the created team
        result_serializer = CreateTeamSerializer(
            instance=team,
            context={'request': request}
        )
        data = result_serializer.data
        
        self.assertEqual(data['role'], 'owner')
        self.assertEqual(data['member_count'], 1)

    def test_create_duplicate_team_name(self):
        """Test creating team with duplicate name fails"""
        # Create first team
        Team.objects.create(name='Duplicate Name')
        
        request = self.factory.post('/')
        request.user = self.user
        
        serializer = CreateTeamSerializer(
            data={'name': 'Duplicate Name', 'max_members': 10},
            context={'request': request}
        )
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('name', serializer.errors)