from django.urls import path, include
from apps.authentication.profile import views as profile_views

urlpatterns = [
    path("api/track/", include("apps.analytics.urls")),
    path("api/analytics/", include("apps.analytics.urls")),
    path("api/education/", include("apps.education.urls")),
    path("api/actions/", include("apps.actions.urls")),
    path("api/team/", include("apps.team.urls")),
    path("api/authentication/", include("apps.authentication.urls")),
    path("profile/", profile_views.user_profile, name='user_profile'),
    path("profile/update/", profile_views.update_profile, name='update_profile'),
]