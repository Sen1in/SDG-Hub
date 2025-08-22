from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth.models import User

class TestUserProfileViews(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='diana', password='123', email='d@d.com')
        self.client.login(username='diana', password='123')

    def test_get_profile(self):
        response = self.client.get(reverse('user_profile'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['username'], 'diana')

    def test_update_profile(self):
        data = {'first_name': 'D', 'organization': 'OrgD'}
        response = self.client.put(reverse('update_profile'), data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user']['first_name'], 'D')
        self.assertEqual(response.data['user']['userprofile']['organization'], 'OrgD')

    def test_profile_view_unauthenticated(self):
        self.client.logout()
        response = self.client.get(reverse('user_profile'))
        self.assertEqual(response.status_code, 403)

    def test_partial_update_profile(self):
        response = self.client.patch(reverse('update_profile'), {'bio': 'new bio'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user']['userprofile']['bio'], 'new bio')

