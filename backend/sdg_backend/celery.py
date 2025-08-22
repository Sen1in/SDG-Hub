import os
from celery import Celery

# Set the default settings module for Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sdg_backend.settings')

app = Celery('sdg_backend')

# Configure Celery using Django's settings file
app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')