from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/form/(?P<form_id>\w+)/$', consumers.FormCollaborationConsumer.as_asgi()),
]
