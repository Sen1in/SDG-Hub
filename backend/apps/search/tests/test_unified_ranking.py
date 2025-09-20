"""
Tests for unified ranking implementation
"""
from django.test import TestCase, Client
from django.urls import reverse
from django.db import connection
import json


class UnifiedRankingTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        """Set up test data with mixed award/year scenarios"""
        with connection.cursor() as cursor:
            # Create education_db table with test data
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
                INSERT INTO education_db (Title, descriptions, Organization, Year, `SDGs related`, Location)
                VALUES 
                ('Climate Course 2024', 'Latest climate education', 'UN', '2024', '13', 'Global'),
                ('Old Climate Course', 'Old climate education', 'UN', '2019', '13', 'Global');
            """)

            # Create action_db table with award data
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS action_db (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    Actions TEXT,
                    `Action detail` TEXT,
                    `Individual/Organization` INT,
                    `Source Links` TEXT,
                    ` SDGs` TEXT,
                    `Location (specific actions/org onlyonly)` TEXT,
                    Award INT
                );
            """)
            cursor.execute("CREATE FULLTEXT INDEX action_ft_idx ON action_db (Actions, `Action detail`);")

            cursor.execute("""
                INSERT INTO action_db (Actions, `Action detail`, `Individual/Organization`, ` SDGs`, `Location (specific actions/org onlyonly)`, Award)
                VALUES 
                ('A Awarded Action', 'This action won an award', 1, '13', 'City', 1),
                ('B No Award Action', 'This action has no award', 1, '13', 'City', 0),
                ('Z Awarded Action', 'Another awarded action', 1, '13', 'City', 1);
            """)

            # Create keyword_resources table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS keyword_resources (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    keyword TEXT,
                    sdg_number INT,
                    target_code VARCHAR(10),
                    target_description TEXT,
                    reference1 TEXT
                );
            """)
            cursor.execute("CREATE FULLTEXT INDEX keyword_ft_idx ON keyword_resources (keyword);")

            cursor.execute("""
                INSERT INTO keyword_resources (keyword, sdg_number, target_code, target_description, reference1)
                VALUES 
                ('climate change', 13, '13.1', 'Climate action description', 'Reference 1');
            """)

    def test_unified_ranking_default_sort(self):
        """Test that default sorting uses unified ranking"""
        client = Client()
        response = client.get('/api/search/', {'q': 'climate'})
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        results = data['results']
        
        # Should have results from all sources
        self.assertGreater(len(results), 0)
        
        # Find awarded and non-awarded actions
        awarded_actions = [r for r in results if r.get('source') == 'actions' and r.get('has_award') == 1]
        non_awarded_actions = [r for r in results if r.get('source') == 'actions' and r.get('has_award') == 0]
        
        if awarded_actions and non_awarded_actions:
            # Awarded actions should come before non-awarded
            awarded_indices = [results.index(a) for a in awarded_actions]
            non_awarded_indices = [results.index(a) for a in non_awarded_actions]
            
            min_awarded_index = min(awarded_indices)
            max_non_awarded_index = max(non_awarded_indices)
            
            self.assertLess(min_awarded_index, max_non_awarded_index, 
                          "Awarded actions should appear before non-awarded actions")

    def test_unified_ranking_explicit_sort(self):
        """Test explicit unified_ranking sort parameter"""
        client = Client()
        response = client.get('/api/search/', {'q': 'climate', 'sort': 'unified_ranking'})
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        results = data['results']
        
        # Verify sorting order for items with same award status
        same_award_items = {}
        for item in results:
            has_award = item.get('has_award', 0)
            if has_award not in same_award_items:
                same_award_items[has_award] = []
            same_award_items[has_award].append(item)
        
        # Within same award status, newer years should come first
        for has_award, items in same_award_items.items():
            if len(items) > 1:
                years = [item.get('year', 0) for item in items]
                # Years should be in descending order (newer first)
                self.assertEqual(years, sorted(years, reverse=True), 
                               f"Years not properly sorted for has_award={has_award}")

    def test_has_award_field_in_results(self):
        """Test that has_award field is properly included in results"""
        client = Client()
        response = client.get('/api/search/', {'q': 'action'})
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        results = data['results']
        
        action_results = [r for r in results if r.get('source') == 'actions']
        
        # All action results should have has_award field
        for action in action_results:
            self.assertIn('has_award', action)
            self.assertIn(action['has_award'], [0, 1])

    def test_year_extraction_from_education(self):
        """Test that year is properly extracted from education data"""
        client = Client()
        response = client.get('/api/search/', {'q': 'course'})
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        results = data['results']
        
        education_results = [r for r in results if r.get('source') == 'education']
        
        # Find the 2024 and 2019 courses
        course_2024 = next((r for r in education_results if r.get('year') == 2024), None)
        course_2019 = next((r for r in education_results if r.get('year') == 2019), None)
        
        if course_2024 and course_2019:
            # 2024 course should come before 2019 course (newer first)
            index_2024 = results.index(course_2024)
            index_2019 = results.index(course_2019)
            self.assertLess(index_2024, index_2019, 
                          "Newer education course should appear before older one")

    def test_title_alphabetical_sorting(self):
        """Test that titles are sorted alphabetically within same award/year"""
        client = Client()
        response = client.get('/api/search/', {'q': 'action'})
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        results = data['results']
        
        awarded_actions = [r for r in results if r.get('source') == 'actions' and r.get('has_award') == 1]
        
        if len(awarded_actions) >= 2:
            # Among awarded actions, titles should be in alphabetical order
            titles = [action.get('title', '').lower() for action in awarded_actions]
            self.assertEqual(titles, sorted(titles), 
                           "Awarded action titles should be in alphabetical order")

    def tearDown(self):
        """Clean up test tables"""
        with connection.cursor() as cursor:
            cursor.execute("DROP TABLE IF EXISTS education_db")
            cursor.execute("DROP TABLE IF EXISTS action_db") 
            cursor.execute("DROP TABLE IF EXISTS keyword_resources")
