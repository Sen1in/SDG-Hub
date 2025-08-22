# apps/analytics/tests/test_search_api.py
from django.test import TestCase
from rest_framework.test import APIClient
from apps.analytics.models import UserBehavior
from django.contrib.auth.models import User

class TrackSearchAPITest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='tester', password='test123')
        self.client = APIClient()
        self.url = '/api/track/search'

    def test_track_search_saves_behavior(self):
        self.client.login(username='tester', password='test123')
        payload = {"userId": str(self.user.id), "query": "climate change"}
        res = self.client.post(self.url, payload, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(UserBehavior.objects.filter(user_id=str(self.user.id), type='search').exists())