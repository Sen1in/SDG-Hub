from django.db import models

class UserBehavior(models.Model):
    user_id = models.CharField(max_length=100)
    type = models.CharField(max_length=20, default='visit')
    detail = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)

class ClickCount(models.Model):
    content_type = models.CharField(max_length=50, default='education')
    object_id = models.IntegerField()
    click_count = models.IntegerField(default=0)

    class Meta:
        unique_together = ('content_type', 'object_id')