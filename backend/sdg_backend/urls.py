# backend/sdg_backend/urls.py

"""
URL configuration for SDG Knowledge System project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from api.views import home

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),

    path('api/auth/', include('apps.authentication.urls')),
    path('api/education/', include('apps.education.urls')),
    path('api/track/', include('apps.analytics.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/actions/', include('apps.actions.urls')),
    path('api/keywords/', include('apps.keywords.urls')),
    path('api/team/', include('apps.team.urls')),
    path('api/', include('apps.form.urls')),
    path('api/search/', include('apps.search.urls')), 
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/data-management/', include('apps.data_management.urls')),
]


is_development = any(host in ['localhost', '127.0.0.1', '0.0.0.0'] for host in settings.ALLOWED_HOSTS)

if settings.DEBUG or is_development:
    
    from django.views.static import serve
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]
    
    
    if hasattr(settings, 'STATIC_ROOT') and settings.STATIC_ROOT:
        urlpatterns += [
            re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
        ]


if settings.DEBUG:
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [path('__debug__/', include(debug_toolbar.urls))] + urlpatterns