from django.urls import path
from . import views

urlpatterns = [
    # Team form management
    path('team/<int:team_id>/forms/', views.TeamFormListCreateView.as_view(), name='team-form-list-create'),
    path('team/<int:team_id>/forms/stats/', views.team_form_stats, name='team-form-stats'),
    
    # Form Details Management
    path('forms/<int:pk>/', views.FormDetailView.as_view(), name='form-detail'),
    path('forms/<int:form_id>/toggle-lock/', views.toggle_form_lock, name='toggle-form-lock'),
    path('forms/<int:form_id>/duplicate/', views.duplicate_form, name='duplicate-form'),

    # Collaborative editing related
    path('forms/<int:form_id>/collaborative/', views.CollaborativeFormDetailView.as_view(), name='collaborative-form-detail'),
    path('forms/<int:form_id>/collaborative/batch/', views.collaborative_form_batch_update, name='collaborative-form-batch-update'),
    path('forms/<int:form_id>/edit-session/start/', views.start_edit_session, name='start-edit-session'),
    path('forms/<int:form_id>/edit-session/end/', views.end_edit_session, name='end-edit-session'),
    path('forms/<int:form_id>/active-editors/', views.get_active_editors, name='get-active-editors'),

    # Form export
    path('forms/<int:form_id>/export/', views.export_form_pdf, name='export-form-pdf'),
    path('forms/<int:form_id>/export-ppt/', views.export_ida_ppt, name='export_ida_ppt'),
]