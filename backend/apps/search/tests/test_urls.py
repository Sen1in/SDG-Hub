# apps/search/tests/test_urls.py
from django.test import SimpleTestCase
from django.urls import reverse, resolve
from apps.search.views import unified_search

class TestSearchUrls(SimpleTestCase):
    def test_search_url_resolves(self):
        resolver = resolve('/api/search/')
        self.assertEqual(resolver.func, unified_search)
