from rest_framework import serializers
from .models import KeywordResource, KeywordLike, Reference

class ReferenceSerializer(serializers.ModelSerializer):
    """Reference serializer"""
    reference_no = serializers.ReadOnlyField()  # This is a property
    
    class Meta:
        model = Reference
        fields = ['id', 'reference_no', 'source']

class KeywordResourceSerializer(serializers.ModelSerializer):
    """Keyword resource serializer with optimized reference handling"""
    sdg_title = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    reference1_detail = serializers.SerializerMethodField()
    reference2_detail = serializers.SerializerMethodField()
    
    class Meta:
        model = KeywordResource
        fields = [
            'id', 'keyword', 'sdg_number', 'target_code', 
            'target_description', 'reference1', 'reference2', 
            'reference1_detail', 'reference2_detail',
            'note', 'sdg_title', 'is_liked', 'created_at'
        ]
    
    def get_sdg_title(self, obj):
        """Get the title of the corresponding SDG"""
        sdg_titles = {
            1: 'No Poverty', 2: 'Zero Hunger', 3: 'Good Health and Well-being', 
            4: 'Quality Education', 5: 'Gender Equality', 6: 'Clean Water and Sanitation',
            7: 'Affordable and Clean Energy', 8: 'Decent Work and Economic Growth',
            9: 'Industry, Innovation and Infrastructure', 10: 'Reduced Inequalities',
            11: 'Sustainable Cities and Communities', 12: 'Responsible Consumption and Production',
            13: 'Climate Action', 14: 'Life Below Water', 15: 'Life on Land',
            16: 'Peace, Justice and Strong Institutions', 17: 'Partnerships for the Goals'
        }
        return sdg_titles.get(obj.sdg_number, f'SDG {obj.sdg_number}')
    
    def get_is_liked(self, obj):
        """Check whether the keyword has been liked by the current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return KeywordLike.objects.filter(
                user=request.user, 
                keyword_resource=obj
            ).exists()
        return False
    
    def get_reference1_detail(self, obj):
        """Get detailed reference1 information"""
        if obj.reference1:
            return ReferenceSerializer(obj.reference1).data
        return None
    
    def get_reference2_detail(self, obj):
        """Get detailed reference2 information"""
        if obj.reference2:
            return ReferenceSerializer(obj.reference2).data
        return None

class KeywordStatsSerializer(serializers.Serializer):
    """Keyword statistics serializer"""
    total_keywords = serializers.IntegerField()
    unique_keywords = serializers.IntegerField()
    sdg_distribution = serializers.DictField()
    target_distribution = serializers.DictField()
    filter_options = serializers.DictField()

class KeywordSearchResultSerializer(serializers.Serializer):
    """Keyword search result serializer"""
    keyword = serializers.CharField()
    related_targets = serializers.ListField()
    target_count = serializers.IntegerField()