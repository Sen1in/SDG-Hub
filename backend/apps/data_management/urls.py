from django.urls import path
from . import views

urlpatterns = [
    # Education Management URLs
    path('education/list/', views.education_management_list, name='education_management_list'),
    path('education/delete/', views.education_management_delete, name='education_management_delete'),
    path('education/upload/', views.education_excel_upload, name='education_excel_upload'),
    path('education/import/', views.education_import_confirm, name='education_import_confirm'),
    
    # Actions Management URLs
    path('actions/list/', views.actions_management_list, name='actions_management_list'),
    path('actions/delete/', views.actions_management_delete, name='actions_management_delete'),
    path('actions/upload/', views.actions_excel_upload, name='actions_excel_upload'),
    path('actions/import/', views.actions_import_confirm, name='actions_import_confirm'),
]
