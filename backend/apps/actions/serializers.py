from rest_framework import serializers
from .models import ActionDb
from .models import LikedAction

class ActionDbSerializer(serializers.ModelSerializer):

    sdgs_list = serializers.ReadOnlyField()
    level_label = serializers.ReadOnlyField()
    individual_organization_label = serializers.ReadOnlyField()
    digital_actions_label = serializers.ReadOnlyField()
    award_label = serializers.ReadOnlyField()
    industry_list = serializers.ReadOnlyField()
    location = serializers.ReadOnlyField()
    related_industry = serializers.ReadOnlyField()
    
    class Meta:
        model = ActionDb
        fields = [
            'id', 'actions', 'action_detail', 
            'field_sdgs', 'sdgs_list',
            'level', 'level_label',
            'individual_organization', 'individual_organization_label',
            'location_specific_actions_org_onlyonly_field', 'location',
            'related_industry_org_only_field', 'related_industry', 'industry_list',
            'digital_actions', 'digital_actions_label',
            'source_descriptions', 'source_links',
            'award', 'award_label', 'award_descriptions',
            'additional_notes'
        ]

class ActionDbListSerializer(serializers.ModelSerializer):

    sdgs_list = serializers.ReadOnlyField()
    level_label = serializers.ReadOnlyField()
    individual_organization_label = serializers.ReadOnlyField()
    location = serializers.ReadOnlyField()
    
    class Meta:
        model = ActionDb
        fields = [
            'id', 'actions', 'action_detail',
            'sdgs_list', 'level', 'level_label',
            'individual_organization', 'individual_organization_label',
            'location', 'award', 'award_label'
        ]

class ActionSearchSerializer(serializers.Serializer):

    search = serializers.CharField(max_length=255, required=False, help_text="Search for titles and details")
    

    sdg = serializers.ListField(
        child=serializers.IntegerField(min_value=1, max_value=17),
        required=False,
        help_text="List of SDG Target Numbers"
    )
    level = serializers.ListField(
        child=serializers.IntegerField(min_value=1, max_value=6),
        required=False,
        help_text="List of grades"
    )
    individual_organization = serializers.ListField(
        child=serializers.IntegerField(min_value=0, max_value=2),
        required=False,
        help_text="List of individual/organizational types"
    )
    location = serializers.CharField(max_length=255, required=False, help_text="Location filtering")
    industry = serializers.CharField(max_length=255, required=False, help_text="Industry filtering")
    digital_actions = serializers.IntegerField(min_value=0, max_value=1, required=False, help_text="Digital filtering")
    award = serializers.IntegerField(min_value=0, max_value=1, required=False, help_text="Award filtering")
    
    page = serializers.IntegerField(min_value=1, required=False, default=1)
    page_size = serializers.IntegerField(min_value=1, max_value=100, required=False, default=20)


class LikedActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LikedAction
        fields = '__all__'