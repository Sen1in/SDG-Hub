from django.test import TestCase
from django.contrib.auth.models import User
from apps.authentication.profile.serializers import UserSerializer, UserUpdateSerializer

class TestUserSerializers(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='charlie', email='c@c.com', password='123')

    def test_user_serializer_output(self):
        serializer = UserSerializer(self.user)
        self.assertEqual(serializer.data['username'], 'charlie')
        self.assertIn('userprofile', serializer.data)

    def test_user_update_serializer(self):
        data = {'first_name': 'C', 'organization': 'OrgC'}
        serializer = UserUpdateSerializer(self.user, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.first_name, 'C')
        self.assertEqual(user.userprofile.organization, 'OrgC')
    def test_invalid_email_rejected(self):
        data = {
            'email': 'not-an-email',  # invalid email
            'first_name': 'Name'
        }
        serializer = UserUpdateSerializer(instance=self.user, data=data, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_empty_optional_fields_are_accepted(self):
        data = {
            'bio': '',
            'language': '',
            'positions': '',
        }
        serializer = UserUpdateSerializer(instance=self.user, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
