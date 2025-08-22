from django.urls import path
from . import views

urlpatterns = [
    # Team list and creation
    path('', views.TeamListCreateView.as_view(), name='team-list-create'),
    
    # Team detail, update, delete
    path('<int:pk>/', views.TeamDetailView.as_view(), name='team-detail'),
    
    # Team member management
    path('<int:team_id>/invite/', views.invite_member, name='invite-member'),
    path('<int:team_id>/leave/', views.leave_team, name='leave-team'),
    
    path('<int:team_id>/members/<int:member_id>/role/', views.update_member_role, name='update-member-role'),
    path('<int:team_id>/members/<int:member_id>/', views.remove_member, name='remove-member'),
    
    # User validation
    path('check-user/', views.check_user_exists, name='check-user'),
]