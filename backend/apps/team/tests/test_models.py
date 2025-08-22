from django.test import TestCase
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from apps.team.models import Team, TeamMembership


class TeamModelTest(TestCase):
    """Team model tests"""

    def setUp(self):
        """Set up test data"""
        self.user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )

    def test_create_team(self):
        """Test creating a team"""
        team = Team.objects.create(
            name='Test Team',
            max_members=10
        )
        self.assertEqual(team.name, 'Test Team')
        self.assertEqual(team.max_members, 10)
        self.assertIsNotNone(team.created_at)
        self.assertIsNotNone(team.updated_at)

    def test_team_name_unique(self):
        """Test team name uniqueness"""
        Team.objects.create(name='Unique Team')
        with self.assertRaises(IntegrityError):
            Team.objects.create(name='Unique Team')

    def test_team_max_members_validation(self):
        """Test max_members validation"""
        # Test valid range
        team = Team(name='Valid Team', max_members=50)
        team.full_clean()  # Should not raise exception
        
        # Test invalid values will be caught by model validators
        with self.assertRaises(ValidationError):
            team = Team(name='Invalid Team 1', max_members=0)
            team.full_clean()
        
        with self.assertRaises(ValidationError):
            team = Team(name='Invalid Team 2', max_members=101)
            team.full_clean()

    def test_team_str_method(self):
        """Test team string representation"""
        team = Team.objects.create(name='String Test Team')
        self.assertEqual(str(team), 'String Test Team')

    def test_team_member_count_property(self):
        """Test member count property"""
        team = Team.objects.create(name='Count Test Team')
        self.assertEqual(team.member_count, 0)
        
        # Add members
        TeamMembership.objects.create(user=self.user1, team=team, role='owner')
        TeamMembership.objects.create(user=self.user2, team=team, role='view')
        
        self.assertEqual(team.member_count, 2)

    def test_get_owner_method(self):
        """Test get_owner method"""
        team = Team.objects.create(name='Owner Test Team')
        
        # No owner initially
        self.assertIsNone(team.get_owner())
        
        # Create owner
        membership = TeamMembership.objects.create(
            user=self.user1, 
            team=team, 
            role='owner'
        )
        
        owner = team.get_owner()
        self.assertEqual(owner, membership)
        self.assertEqual(owner.user, self.user1)


class TeamMembershipModelTest(TestCase):
    """TeamMembership model tests"""

    def setUp(self):
        """Set up test data"""
        self.user1 = User.objects.create_user(
            username='member1',
            email='member1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='member2',
            email='member2@example.com',
            password='testpass123'
        )
        self.user3 = User.objects.create_user(
            username='member3',
            email='member3@example.com',
            password='testpass123'
        )
        self.team = Team.objects.create(name='Membership Test Team')

    def test_create_membership(self):
        """Test creating team membership"""
        membership = TeamMembership.objects.create(
            user=self.user1,
            team=self.team,
            role='owner'
        )
        self.assertEqual(membership.user, self.user1)
        self.assertEqual(membership.team, self.team)
        self.assertEqual(membership.role, 'owner')
        self.assertIsNotNone(membership.joined_at)
        self.assertIsNotNone(membership.last_active)

    def test_membership_unique_together(self):
        """Test user can only have one role per team"""
        TeamMembership.objects.create(
            user=self.user1,
            team=self.team,
            role='owner'
        )
        
        # Should raise IntegrityError for duplicate membership
        with self.assertRaises(IntegrityError):
            TeamMembership.objects.create(
                user=self.user1,
                team=self.team,
                role='edit'
            )

    def test_membership_str_method(self):
        """Test membership string representation"""
        membership = TeamMembership.objects.create(
            user=self.user1,
            team=self.team,
            role='owner'
        )
        expected = f"{self.user1.username} - {self.team.name} (owner)"
        self.assertEqual(str(membership), expected)

    def test_role_choices(self):
        """Test role choices validation"""
        # Valid roles
        valid_roles = ['owner', 'edit', 'view']
        for role in valid_roles:
            membership = TeamMembership(
                user=self.user1,
                team=self.team,
                role=role
            )
            membership.full_clean()  # Should not raise exception

    def test_default_role(self):
        """Test default role is 'view'"""
        membership = TeamMembership.objects.create(
            user=self.user1,
            team=self.team
        )
        self.assertEqual(membership.role, 'view')

    def test_owner_uniqueness_on_save(self):
        """Test only one owner per team enforcement"""
        # Create first owner
        membership1 = TeamMembership.objects.create(
            user=self.user1,
            team=self.team,
            role='owner'
        )
        
        # Create second owner - should demote first owner to edit
        membership2 = TeamMembership.objects.create(
            user=self.user2,
            team=self.team,
            role='owner'
        )
        
        # Refresh from database
        membership1.refresh_from_db()
        membership2.refresh_from_db()
        
        # Check that first owner was demoted
        self.assertEqual(membership1.role, 'edit')
        self.assertEqual(membership2.role, 'owner')

    def test_owner_uniqueness_on_update(self):
        """Test owner uniqueness when updating existing membership"""
        # Create owner and editor
        owner = TeamMembership.objects.create(
            user=self.user1,
            team=self.team,
            role='owner'
        )
        editor = TeamMembership.objects.create(
            user=self.user2,
            team=self.team,
            role='edit'
        )
        
        # Update editor to owner
        editor.role = 'owner'
        editor.save()
        
        # Refresh from database
        owner.refresh_from_db()
        editor.refresh_from_db()
        
        # Check that original owner was demoted
        self.assertEqual(owner.role, 'edit')
        self.assertEqual(editor.role, 'owner')

    def test_multiple_teams_same_user(self):
        """Test user can be in multiple teams"""
        team2 = Team.objects.create(name='Second Team')
        
        # User can be owner of first team
        membership1 = TeamMembership.objects.create(
            user=self.user1,
            team=self.team,
            role='owner'
        )
        
        # And member of second team
        membership2 = TeamMembership.objects.create(
            user=self.user1,
            team=team2,
            role='view'
        )
        
        self.assertEqual(membership1.team, self.team)
        self.assertEqual(membership2.team, team2)
        self.assertEqual(membership1.user, membership2.user)

    def test_team_deletion_cascades(self):
        """Test membership deletion when team is deleted"""
        membership = TeamMembership.objects.create(
            user=self.user1,
            team=self.team,
            role='owner'
        )
        
        team_id = self.team.id
        membership_id = membership.id
        
        # Delete team
        self.team.delete()
        
        # Membership should be deleted too
        self.assertFalse(
            TeamMembership.objects.filter(id=membership_id).exists()
        )

    def test_user_deletion_cascades(self):
        """Test membership deletion when user is deleted"""
        membership = TeamMembership.objects.create(
            user=self.user1,
            team=self.team,
            role='owner'
        )
        
        user_id = self.user1.id
        membership_id = membership.id
        
        # Delete user
        self.user1.delete()
        
        # Membership should be deleted too
        self.assertFalse(
            TeamMembership.objects.filter(id=membership_id).exists()
        )