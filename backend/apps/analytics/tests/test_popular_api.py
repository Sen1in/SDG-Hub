# apps/analytics/tests/test_popular_api.py
from django.test import TestCase
from rest_framework.test import APIClient
from apps.analytics.models import ClickCount
from django.contrib.auth.models import User

class PopularContentAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        ClickCount.objects.create(content_type='education', object_id=1, click_count=5)
        ClickCount.objects.create(content_type='education', object_id=2, click_count=10)
        ClickCount.objects.create(content_type='action', object_id=3, click_count=7)

    def test_popular_content_sorted(self):
        res = self.client.get('/api/analytics/popular/')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn('education', data)
        self.assertIn('action', data)
        self.assertGreaterEqual(data['education'][0]['count'], data['education'][1]['count'])

    def test_empty_content(self):
        ClickCount.objects.all().delete()
        res = self.client.get('/api/analytics/popular/')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data['education'], [])
        self.assertEqual(data['action'], [])