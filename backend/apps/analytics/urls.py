# backend/apps/analytics/urls.py

from django.urls import path
from .views import (
    track_page, 
    track_search, 
    track_click, 
    popular_search_terms, 
    get_popular_content,
    ActiveUserStatsView,
    ActiveTrendChartView,
    search_terms_word_cloud, 
    page_active_time 
)

urlpatterns = [
    # Existing URLs
    path('page', track_page),
    path('search', track_search),
    path('click', track_click),
    path('popular-search-terms/', popular_search_terms, name='popular_search_terms'),
    path('popular/', get_popular_content),
    path('stats/active-users/', ActiveUserStatsView.as_view(), name='analytics-active-users'),
    path('active-trend-chart/', ActiveTrendChartView.as_view(), name='active-trend-chart'),
    path('word-cloud/search-terms/', search_terms_word_cloud, name='word-cloud-search-terms'),
    path('page-active-time', page_active_time, name='page-active-time'),
]