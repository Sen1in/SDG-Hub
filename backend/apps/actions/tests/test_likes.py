from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from apps.actions.models import LikedAction

class LikeActionTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client = APIClient()
        self.client.login(username='testuser', password='testpass')
        self.action_id = 99999  

    def test_like(self):
        response = self.client.post('/api/actions/like/', {'action_id': self.action_id}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(LikedAction.objects.filter(user=self.user, action_id=self.action_id).exists())

    def test_unlike(self):
        LikedAction.objects.create(user=self.user, action_id=self.action_id)
        response = self.client.delete('/api/actions/like/', {'action_id': self.action_id}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(LikedAction.objects.filter(user=self.user, action_id=self.action_id).exists())

    def test_list_liked(self):
        LikedAction.objects.create(user=self.user, action_id=1001)
        LikedAction.objects.create(user=self.user, action_id=1002)

        response = self.client.get('/api/actions/liked/')
        self.assertEqual(response.status_code, 200)
        liked_ids = response.json().get('liked_ids', [])
        self.assertIn(1001, liked_ids)
        self.assertIn(1002, liked_ids)