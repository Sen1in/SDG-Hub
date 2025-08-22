from django.test import TestCase
from django.contrib.auth.models import User
from apps.authentication.profile.models import UserProfile

class TestUserProfileModel(TestCase):
    def test_user_profile_created(self):
        user = User.objects.create_user(username='alice', password='123')
        self.assertTrue(hasattr(user, 'userprofile'))

    def test_user_profile_str(self):
        user = User.objects.create_user(username='bob', password='123')
        self.assertEqual(str(user.userprofile), "bob's Profile")
