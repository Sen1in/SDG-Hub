# apps/analytics/tests/test_models.py
from django.test import TestCase
from apps.analytics.models import ClickCount, UserBehavior
from django.db import IntegrityError

class ClickCountModelTest(TestCase):
    def test_default_click_count_is_zero(self):
        obj = ClickCount.objects.create(content_type='education', object_id=123)
        self.assertEqual(obj.click_count, 0)

    def test_unique_together_constraint(self):
        ClickCount.objects.create(content_type='education', object_id=999)
        with self.assertRaises(IntegrityError):
            ClickCount.objects.create(content_type='education', object_id=999)

class UserBehaviorModelTest(TestCase):
    def test_user_behavior_saved_correctly(self):
        behavior = UserBehavior.objects.create(
            user_id='u1',
            type='search',
            detail={'query': 'sdg test'}
        )
        self.assertEqual(behavior.type, 'search')
        self.assertEqual(behavior.detail['query'], 'sdg test')