from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.team.models import Team, TeamMembership


class TeamViewTest(TestCase):
    """Team view tests"""

    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create test users
        self.owner = User.objects.create_user(
            username='owner',
            email='owner@example.com',
            password='testpass123'
        )
        self.member = User.objects.create_user(
            username='member',
            email='member@example.com',
            password='testpass123'
        )
        self.outsider = User.objects.create_user(
            username='outsider',
            email='outsider@example.com',
            password='testpass123'
        )
        
        # Create test team
        self.team = Team.objects.create(name='Test Team', max_members=10)
        
        # Create memberships
        TeamMembership.objects.create(user=self.owner, team=self.team, role='owner')
        TeamMembership.objects.create(user=self.member, team=self.team, role='view')

    def test_team_list_authenticated(self):
        """Test authenticated user can view team list"""
        self.client.force_authenticate(user=self.owner)
        
        url = reverse('team-list-create')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Team')
        self.assertEqual(response.data[0]['role'], 'owner')

    def test_team_list_unauthenticated(self):
        """Test unauthenticated user cannot access team list"""
        url = reverse('team-list-create')
        response = self.client.get(url)
        
        # DRF can return either 401 or 403 for unauthenticated users
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_create_team(self):
        """Test creating new team"""
        self.client.force_authenticate(user=self.owner)
        
        url = reverse('team-list-create')
        data = {'name': 'New Team', 'max_members': 5}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Team')
        self.assertEqual(response.data['role'], 'owner')
        
        # Verify team was created
        self.assertTrue(Team.objects.filter(name='New Team').exists())

    def test_create_team_invalid_data(self):
        """Test creating team with invalid data"""
        self.client.force_authenticate(user=self.owner)
        
        url = reverse('team-list-create')
        data = {'name': '', 'max_members': -1}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_team_detail_as_member(self):
        """Test team detail view as team member"""
        self.client.force_authenticate(user=self.member)
        
        url = reverse('team-detail', kwargs={'pk': self.team.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Team')
        self.assertEqual(response.data['role'], 'view')
        self.assertEqual(len(response.data['members']), 2)

    def test_team_detail_as_outsider(self):
        """Test team detail view as non-member"""
        self.client.force_authenticate(user=self.outsider)
        
        url = reverse('team-detail', kwargs={'pk': self.team.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_team(self):
        """Test updating team"""
        self.client.force_authenticate(user=self.owner)
        
        url = reverse('team-detail', kwargs={'pk': self.team.pk})
        data = {'name': 'Updated Team', 'max_members': 15}
        response = self.client.patch(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Team')
        
        # Verify database update
        self.team.refresh_from_db()
        self.assertEqual(self.team.name, 'Updated Team')

    def test_delete_team_as_owner(self):
        """Test owner can delete team"""
        self.client.force_authenticate(user=self.owner)
        
        url = reverse('team-detail', kwargs={'pk': self.team.pk})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Team.objects.filter(pk=self.team.pk).exists())

    def test_delete_team_as_member(self):
        """Test member cannot delete team"""
        self.client.force_authenticate(user=self.member)
        
        url = reverse('team-detail', kwargs={'pk': self.team.pk})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Team.objects.filter(pk=self.team.pk).exists())


class TeamMembershipTest(TestCase):
    """Team membership tests"""

    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create users
        self.owner = User.objects.create_user(
            username='owner',
            email='owner@example.com',
            password='testpass123'
        )
        self.invitee = User.objects.create_user(
            username='invitee',
            email='invitee@example.com',
            password='testpass123'
        )
        self.member = User.objects.create_user(
            username='member',
            email='member@example.com',
            password='testpass123'
        )
        
        # Create team
        self.team = Team.objects.create(name='Membership Test Team')
        TeamMembership.objects.create(user=self.owner, team=self.team, role='owner')

    def test_check_user_exists(self):
        """Test checking if user exists"""
        self.client.force_authenticate(user=self.owner)
        
        url = reverse('check-user')
        data = {'username': 'invitee'}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['exists'])
        self.assertEqual(response.data['user']['username'], 'invitee')

    def test_check_nonexistent_user(self):
        """Test checking non-existent user"""
        self.client.force_authenticate(user=self.owner)
        
        url = reverse('check-user')
        data = {'username': 'nonexistent'}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['exists'])

    def test_invite_member(self):
        """Test inviting member to team"""
        self.client.force_authenticate(user=self.owner)
        
        url = reverse('invite-member', kwargs={'team_id': self.team.id})
        data = {'username': 'invitee'}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('Successfully invited', response.data['message'])
        
        # Verify membership created
        membership = TeamMembership.objects.get(user=self.invitee, team=self.team)
        self.assertEqual(membership.role, 'view')

    def test_invite_nonexistent_user(self):
        """Test inviting non-existent user fails"""
        self.client.force_authenticate(user=self.owner)
        
        url = reverse('invite-member', kwargs={'team_id': self.team.id})
        data = {'username': 'nonexistent'}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_member_leave_team(self):
        """Test member can leave team"""
        # Add member first
        TeamMembership.objects.create(user=self.member, team=self.team, role='view')
        
        self.client.force_authenticate(user=self.member)
        
        url = reverse('leave-team', kwargs={'team_id': self.team.id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Successfully left', response.data['message'])
        
        # Verify membership removed
        self.assertFalse(
            TeamMembership.objects.filter(user=self.member, team=self.team).exists()
        )

    def test_owner_cannot_leave_with_members(self):
        """Test owner cannot leave team with other members"""
        # Add another member
        TeamMembership.objects.create(user=self.member, team=self.team, role='view')
        
        self.client.force_authenticate(user=self.owner)
        
        url = reverse('leave-team', kwargs={'team_id': self.team.id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Owner cannot leave team with other members', response.data['error'])


class TeamRoleManagementTest(TestCase):
    """Team role management tests"""

    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create users
        self.owner = User.objects.create_user(
            username='owner',
            email='owner@example.com',
            password='testpass123'
        )
        self.member = User.objects.create_user(
            username='member',
            email='member@example.com',
            password='testpass123'
        )
        
        # Create team and memberships
        self.team = Team.objects.create(name='Role Test Team')
        self.owner_membership = TeamMembership.objects.create(
            user=self.owner, team=self.team, role='owner'
        )
        self.member_membership = TeamMembership.objects.create(
            user=self.member, team=self.team, role='view'
        )

    def test_update_member_role(self):
        """Test owner can update member role"""
        self.client.force_authenticate(user=self.owner)
        
        url = reverse('update-member-role', kwargs={
            'team_id': self.team.id,
            'member_id': self.member_membership.id
        })
        data = {'role': 'edit'}
        response = self.client.patch(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify role updated
        self.member_membership.refresh_from_db()
        self.assertEqual(self.member_membership.role, 'edit')

    def test_non_owner_cannot_update_roles(self):
        """Test non-owner cannot update member roles"""
        self.client.force_authenticate(user=self.member)
        
        url = reverse('update-member-role', kwargs={
            'team_id': self.team.id,
            'member_id': self.member_membership.id
        })
        data = {'role': 'edit'}
        response = self.client.patch(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_remove_member(self):
        """Test owner can remove member"""
        self.client.force_authenticate(user=self.owner)
        
        url = reverse('remove-member', kwargs={
            'team_id': self.team.id,
            'member_id': self.member_membership.id
        })
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify member removed
        self.assertFalse(
            TeamMembership.objects.filter(id=self.member_membership.id).exists()
        )

    def test_cannot_remove_self(self):
        """Test owner cannot remove themselves"""
        self.client.force_authenticate(user=self.owner)
        
        url = reverse('remove-member', kwargs={
            'team_id': self.team.id,
            'member_id': self.owner_membership.id
        })
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Cannot remove yourself', response.data['error'])