# apps/education/tests/test_likes.py

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from apps.education.models import LikedEducation

class LikeEducationTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client = APIClient()
        self.client.login(username='testuser', password='testpass')
        self.education_id = 12345

    def test_like(self):
        response = self.client.post('/api/education/like/', {'education_id': self.education_id}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(LikedEducation.objects.filter(user=self.user, education_id=self.education_id).exists())

    def test_unlike(self):
        LikedEducation.objects.create(user=self.user, education_id=self.education_id)
        response = self.client.delete('/api/education/like/', {'education_id': self.education_id}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(LikedEducation.objects.filter(user=self.user, education_id=self.education_id).exists())

    def test_list_liked(self):
        LikedEducation.objects.create(user=self.user, education_id=123)
        LikedEducation.objects.create(user=self.user, education_id=456)

        response = self.client.get('/api/education/liked/')
        self.assertEqual(response.status_code, 200)
        liked_ids = response.json().get('liked_ids', [])
        self.assertIn(123, liked_ids)
        self.assertIn(456, liked_ids)