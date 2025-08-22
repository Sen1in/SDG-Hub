# apps/analytics/tests/test_click_api.py
from django.test import TestCase
from rest_framework.test import APIClient
from apps.analytics.models import ClickCount
from django.contrib.auth.models import User

class ClickCountAPITest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='tester', password='test123')
        self.client = APIClient()
        self.url = '/api/track/click'

    def test_requires_authentication(self):
        client = APIClient()
        res = client.post(self.url, {"contentType": "education", "objectId": 1}, format='json')
        self.assertIn(res.status_code, (401, 403))

    def test_click_increases_count(self):
        self.client.login(username='tester', password='test123')
        payload = {"contentType": "education", "objectId": 1}
        res1 = self.client.post(self.url, payload, format='json')
        self.assertEqual(res1.status_code, 200)
        obj = ClickCount.objects.get(content_type='education', object_id=1)
        self.assertEqual(obj.click_count, 1)

        res2 = self.client.post(self.url, payload, format='json')
        self.assertEqual(res2.status_code, 200)
        obj.refresh_from_db()
        self.assertEqual(obj.click_count, 2)

    def test_missing_parameters(self):
        self.client.login(username='tester', password='test123')
        res = self.client.post(self.url, {"contentType": "education"}, format='json')
        self.assertEqual(res.status_code, 400)