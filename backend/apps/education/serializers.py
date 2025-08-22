from rest_framework import serializers
from .models import EducationDb
from .models import LikedEducation

class EducationDbSerializer(serializers.ModelSerializer):
    """
    Education database serializer
    """
    sdgs_list = serializers.ReadOnlyField()
    type_list = serializers.ReadOnlyField()
    discipline_list = serializers.ReadOnlyField()
    industry_list = serializers.ReadOnlyField()
    year_int = serializers.ReadOnlyField()
    
    class Meta:
        model = EducationDb
        fields = [
            'id', 'title', 'description', 'descriptions', 'aims', 
            'sdgs_related', 'sdgs_list',
            'learning_outcome_expecting_outcome_field',
            'type_label', 'type_list',
            'location', 'organization', 'year', 'year_int',
            'related_to_which_discipline', 'discipline_list',
            'useful_for_which_industries', 'industry_list',
            'source', 'link'
        ]

class EducationDbListSerializer(serializers.ModelSerializer):
    """
    Education database serializer
    """
    sdgs_list = serializers.ReadOnlyField()
    type_list = serializers.ReadOnlyField()
    year_int = serializers.ReadOnlyField()
    
    class Meta:
        model = EducationDb
        fields = [
            'id', 'title', 'description', 
            'sdgs_list', 'type_list',
            'organization', 'location', 'year', 'year_int'
        ]

class EducationSearchSerializer(serializers.Serializer):
    """
    Search parameter serializer
    """
    # Basic Search
    search = serializers.CharField(max_length=255, required=False, help_text="Search for titles and descriptions")
    
    # serializer
    sdg = serializers.ListField(
        child=serializers.IntegerField(min_value=1, max_value=17),
        required=False,
        help_text="List of SDG Target Numbers"
    )
    year = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        help_text="List of Year"
    )
    location = serializers.CharField(max_length=255, required=False, help_text="Location filtering")
    organization = serializers.CharField(max_length=255, required=False, help_text="Organization filtering")
    discipline = serializers.CharField(max_length=255, required=False, help_text="Discipline filtering")
    industry = serializers.CharField(max_length=255, required=False, help_text="Industry filtering")
    
    page = serializers.IntegerField(min_value=1, required=False, default=1)
    page_size = serializers.IntegerField(min_value=1, max_value=100, required=False, default=20)

class LikedEducationSerializer(serializers.ModelSerializer):
    education = EducationDbListSerializer(source='education_id', read_only=True)

    class Meta:
        model = LikedEducation
        fields = ['education']