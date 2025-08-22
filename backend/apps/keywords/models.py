from django.db import models
from django.contrib.auth.models import User

class KeywordResource(models.Model):
    """Keyword resource model"""
    keyword = models.CharField(max_length=200, db_index=True)
    sdg_number = models.IntegerField()  # SDG number: 1-17
    target_code = models.CharField(max_length=10)  # e.g., 1.1, 2.A, etc.
    target_description = models.TextField()
    reference1 = models.TextField(blank=True, null=True)
    reference2 = models.TextField(blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        managed = False
        db_table = 'keyword_resources'
        verbose_name = 'Keyword Resource'
        verbose_name_plural = 'Keyword Resources'
        indexes = [
            models.Index(fields=['keyword']),
            models.Index(fields=['sdg_number']),
            models.Index(fields=['target_code']),
        ]
        unique_together = ['keyword', 'sdg_number', 'target_code']
    
    def __str__(self):
        return f"{self.keyword} - SDG{self.sdg_number}.{self.target_code}"

class KeywordLike(models.Model):
    """Keyword like/favorite model"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    keyword_resource = models.ForeignKey(KeywordResource, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'keyword_likes'
        unique_together = ['user', 'keyword_resource']
    
    def __str__(self):
        return f"{self.user.username} likes {self.keyword_resource.keyword}"
