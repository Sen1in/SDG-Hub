from django.urls import path
from . import views

app_name = 'keywords'

urlpatterns = [
    # Keyword Resource
    path('', views.KeywordResourceListView.as_view(), name='keyword-list'),
    path('<int:pk>/', views.KeywordResourceDetailView.as_view(), name='keyword-detail'),
    path('stats/', views.keyword_stats, name='keyword-stats'),
    
    # Keyword Search
    path('search/', views.keyword_search, name='keyword-search'),
    path('detail/<str:keyword>/', views.keyword_detail, name='keyword-detail-by-name'),
    path('autocomplete/', views.keyword_autocomplete, name='keyword-autocomplete'),

    # Keyword References
    path('references/', views.references_list, name='references-list'),
    path('references/<int:reference_id>/', views.reference_detail, name='reference-detail'),
    
    # Keyword Likes
    path('<int:keyword_id>/like/', views.like_keyword, name='like-keyword'),
    path('<int:keyword_id>/unlike/', views.unlike_keyword, name='unlike-keyword'),
    path('liked/', views.liked_keywords, name='liked-keywords'),
]
