from django.contrib import admin
from .models import KeywordResource, KeywordLike

@admin.register(KeywordResource)
class KeywordResourceAdmin(admin.ModelAdmin):
    list_display = ['keyword', 'sdg_number', 'target_code', 'target_description']
    list_filter = ['sdg_number', 'target_code']
    search_fields = ['keyword', 'target_description', 'note']
    ordering = ['keyword', 'sdg_number', 'target_code']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('keyword', 'sdg_number', 'target_code', 'target_description')
        }),
        ('References', {
            'fields': ('reference1', 'reference2', 'note')
        }),
    )

@admin.register(KeywordLike)
class KeywordLikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'keyword_resource', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'keyword_resource__keyword']
