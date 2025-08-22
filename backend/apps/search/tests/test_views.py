from django.test import TestCase, Client
from django.db import connection
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth.models import User



class UnifiedSearchTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        with connection.cursor() as cursor:
            # Create education_db table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS education_db (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    Title TEXT,
                    descriptions TEXT,
                    Organization TEXT,
                    Year TEXT,
                    Link TEXT,
                    `SDGs related` TEXT,
                    Location TEXT
                );
            """)
            cursor.execute("CREATE FULLTEXT INDEX education_ft_idx ON education_db (Title, descriptions);")

            cursor.execute("""
                INSERT INTO education_db (Title, descriptions, Organization, Year, Link, `SDGs related`, Location)
                VALUES ('Climate Course', 'Climate education for all', 'UN', '2022', 'https://example.com', '13,4', 'Global');
            """)

            # Create action_db table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS action_db (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    Actions TEXT,
                    `Action detail` TEXT,
                    `Individual/Organization` INT,
                    `Source Links` TEXT,
                    ` SDGs` TEXT,
                    `Location (specific actions/org onlyonly)` TEXT
                );
            """)
            cursor.execute("CREATE FULLTEXT INDEX action_ft_idx ON action_db (Actions, `Action detail`);")

            cursor.execute("""
                INSERT INTO action_db (Actions, `Action detail`, `Individual/Organization`, `Source Links`, ` SDGs`, `Location (specific actions/org onlyonly)`)
                VALUES ('Plant Trees', 'Local tree planting action', 1, 'https://tree.org', '15,13', 'City Park');
            """)

            # Create keyword_resources table
            # create keyword_resources table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS keyword_resources (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    keyword TEXT,
                    reference1 TEXT,
                    target_code TEXT,
                    sdg_number TEXT
                );
            """)
            cursor.execute("""
                SELECT COUNT(1)
                FROM information_schema.STATISTICS
                WHERE table_schema = DATABASE()
                AND table_name = 'keyword_resources'
                AND index_name = 'keyword_ft_idx';
            """)
            exists = cursor.fetchone()[0]
            if not exists:
                cursor.execute("CREATE FULLTEXT INDEX keyword_ft_idx ON keyword_resources (keyword);")

            cursor.execute("""
                INSERT INTO keyword_resources (keyword, reference1, target_code, sdg_number)
                VALUES ('climate', 'Climate Action Reference', '13.1', '13');
            """)


    def setUp(self):
        self.client = APIClient()
        # create and login a user
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client.force_authenticate(user=self.user) 


    def test_search_query_returns_education_result(self):
        response = self.client.get('/api/search/?q=climate')
        self.assertEqual(response.status_code, 200)
        self.assertIn('results', response.json())
        self.assertGreaterEqual(len(response.json()['results']), 1)

    def test_search_query_with_no_results(self):
        response = self.client.get('/api/search/?q=nonexistentkeyword')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 0)

    def test_pagination(self):
        response = self.client.get('/api/search/?q=climate&page=1&size=2')
        self.assertEqual(response.status_code, 200)
        self.assertIn('current_page', response.data)
        self.assertEqual(response.data['current_page'], 1)

    def test_filter_by_source(self):
        response = self.client.get('/api/search/?q=climate&source=education')
        self.assertEqual(response.status_code, 200)
        self.assertIn('results', response.data)

    def test_sort_by_title(self):
        response = self.client.get('/api/search/?q=climate&sort=title')
        self.assertEqual(response.status_code, 200)
