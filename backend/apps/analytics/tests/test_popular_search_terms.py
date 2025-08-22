from django.test import TestCase
from django.test.utils import override_settings
from rest_framework.test import APIClient
from django.utils import timezone
from datetime import timedelta

from apps.analytics.models import UserBehavior
from apps.analytics import views as analytics_views


@override_settings(MIGRATION_MODULES={
    # Disable problematic data/raw-SQL migrations during tests
    'apps.keywords': None,
    'apps.search': None,
})
class PopularSearchTermsAPITest(TestCase):
    def setUp(self) -> None:
        self.client = APIClient()
        # Ensure a clean slate for deterministic counts
        UserBehavior.objects.all().delete()
        # Disable Redis cache usage so the test reflects DB state only
        analytics_views.REDIS_AVAILABLE = False

        # Recent search behaviors (within 7 days)
        UserBehavior.objects.create(
            user_id="u1",
            type="search",
            detail={"query": "climate change"},
        )
        UserBehavior.objects.create(
            user_id="u2",
            type="search",
            detail={"query": "clean energy"},
        )
        UserBehavior.objects.create(
            user_id="u3",
            type="search",
            detail={"query": "climate change"},
        )

        # Very short term should be ignored (< 2 chars)
        short = UserBehavior.objects.create(
            user_id="u4",
            type="search",
            detail={"query": "a"},
        )

        # Old record (8 days ago) should be excluded by the 7-day window
        old = UserBehavior.objects.create(
            user_id="u5",
            type="search",
            detail={"query": "climate change"},
        )
        # Manually move timestamp back beyond 7 days
        UserBehavior.objects.filter(id=old.id).update(
            timestamp=timezone.now() - timedelta(days=8)
        )

    def test_returns_ok_and_expected_shape(self):
        response = self.client.get("/api/analytics/popular-search-terms/")
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)

        first = data[0]
        self.assertIn("term", first)
        self.assertIn("count", first)

    def test_counts_and_filters_apply(self):
        response = self.client.get("/api/analytics/popular-search-terms/")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Build a dict for easy lookup
        term_to_count = {item["term"]: item["count"] for item in data}

        # "climate change" appears twice in recent window, once old (ignored)
        self.assertEqual(term_to_count.get("climate change"), 2)
        # "clean energy" appears once
        self.assertEqual(term_to_count.get("clean energy"), 1)

        # Short term should not appear
        self.assertNotIn("a", term_to_count)

    def test_sorted_descending_by_count(self):
        response = self.client.get("/api/analytics/popular-search-terms/")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        counts = [item["count"] for item in data]
        self.assertEqual(counts, sorted(counts, reverse=True))


