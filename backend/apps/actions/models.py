from django.db import models
import re
from django.contrib.auth.models import User

SDG_CHOICES = (
    (1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, '5'), (6, '6'),
    (7, '7'), (8, '8'), (9, '9'), (10, '10'), (11, '11'), (12, '12'),
    (13, '13'), (14, '14'), (15, '15'), (16, '16'), (17, '17'), (18, 'ALL')
)

LEVEL_CHOICES = (
    (1, 'Level 1 - on Couch, Individual action'),
    (2, 'Level 2 - at Home, Individual action'),
    (3, 'Level 3 - in Community, Individual action'),
    (4, 'Level 4 - at School and Work, Individual action'),
    (5, 'Level 5 - Organization action'),
    (6, 'Level 6 - Government action')
)

INDIVIDUAL_ORGANIZATION_CHOICES = (
    (0, 'Individual'),
    (1, 'Organization'),
    (2, 'Both')
)

DIGITAL_CHOICES = (
    (0, 'YES'),
    (1, 'NO'),
)

AWARD_CHOICES = (
    (0, 'No'),
    (1, 'Yes'),
)

INDUSTRY_CHOICES = [
    'Agriculture forestry and fishing',
    'Mining',
    'Manufacturing', 
    'Electricity gas water and waste services',
    'Construction',
    'Wholesale and retail trade',
    'Accommodation and food services',
    'Transport postal and warehousing',
    'Information media and telecommunications',
    'Financial and insurance services',
    'Rental hiring and real estate services',
    'Professional services',
    'Public administration and safety',
    'Education and training',
    'Health care and social assistance',
    'Arts and recreation services'
]

class ActionDb(models.Model):
    """
    Action Database Model
    """
    id = models.AutoField(primary_key=True)
    actions = models.TextField(db_column='Actions', blank=True, null=True)
    action_detail = models.TextField(db_column='Action detail', blank=True, null=True)
    field_sdgs = models.CharField(db_column=' SDGs', max_length=50, blank=True, null=True)
    level = models.TextField(db_column='Level', blank=True, null=True)
    individual_organization = models.IntegerField(db_column='Individual/Organization', blank=True, null=True)
    location_specific_actions_org_onlyonly_field = models.TextField(
        db_column='Location (specific actions/org onlyonly)', blank=True, null=True
    )
    related_industry_org_only_field = models.TextField(
        db_column='Related Industry (org only)', blank=True, null=True
    )
    digital_actions = models.IntegerField(db_column='Digital actions', blank=True, null=True)
    source_descriptions = models.TextField(db_column='Source descriptions', blank=True, null=True)
    award = models.IntegerField(db_column='Award', blank=True, null=True)
    source_links = models.TextField(db_column='Source Links', blank=True, null=True)
    additional_notes = models.TextField(db_column='Additional Notes', blank=True, null=True)
    column15 = models.CharField(db_column='Column15', max_length=50, blank=True, null=True)
    award_descriptions = models.TextField(db_column='Award descriptions', blank=True, null=True)
    
    class Meta: 
        db_table = 'action_db'
        verbose_name = 'Action Resource'
        verbose_name_plural = 'Action Resources'
        ordering = ['-id']
    
    def __str__(self):
        return self.actions or f"Action Resource {self.id}"
    
    @property
    def sdgs_list(self):
        if not self.field_sdgs:
            return []
        
        sdg_list = []
        item_sdg_string = str(self.field_sdgs)
        item_sdg_parts = re.split(r"\'| |\]|\[|,|\.|\;", item_sdg_string)
        
        for part in item_sdg_parts:
            if part.strip() and part.strip().isdigit():
                sdg_num = int(part.strip())
                if 1 <= sdg_num <= 17:
                    sdg_list.append(sdg_num)
                elif sdg_num == 18:  
                    return list(range(1, 18))  
        
        return sorted(list(set(sdg_list)))  
    
    @property
    def level_list(self):
        """Get the level as a list of integers"""
        if not self.level:
            return []
        
        level_list = []
        level_string = str(self.level)
        level_parts = re.split(r"\'| |\]|\[|,|\.|\;", level_string)
        
        for part in level_parts:
            if part.strip() and part.strip().isdigit():
                level_num = int(part.strip())
                if 1 <= level_num <= 6:  # 假设level范围是1-6
                    level_list.append(level_num)
        
        return sorted(list(set(level_list)))

    @property
    def level_label(self):
        """Get the level label"""
        levels = self.level_list
        if not levels:
            return ''
        if len(levels) == 1:
            level_dict = dict(LEVEL_CHOICES)
            return level_dict.get(levels[0], '')
        else:
            return f"Levels {', '.join(map(str, levels))}"
    
    @property
    def individual_organization_label(self):
        """Obtain personal/organizational tags"""
        if self.individual_organization is not None:
            io_dict = dict(INDIVIDUAL_ORGANIZATION_CHOICES)
            return io_dict.get(self.individual_organization, '')
        return ''
    
    @property
    def digital_actions_label(self):
        """Obtain digital action tags"""
        if self.digital_actions is not None:
            digital_dict = dict(DIGITAL_CHOICES)
            return digital_dict.get(self.digital_actions, '')
        return ''
    
    @property
    def award_label(self):
        """Obtain the award label"""
        if self.award is not None:
            return 'Yes' if self.award == 1 else 'No'
        return ''
    
    @property
    def industry_list(self):
        if not self.related_industry_org_only_field:
            return []
        return [i.strip() for i in self.related_industry_org_only_field.split(',') if i.strip()]
    
    @property
    def location(self):
        return self.location_specific_actions_org_onlyonly_field or ''
    
    @property
    def related_industry(self):
        return self.related_industry_org_only_field or ''
    
    def get_absolute_url(self):
        return f"/action/{self.id}/"

class LikedAction(models.Model):
    """
    The user's collection and likes table for Action
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action_id = models.IntegerField()  
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'liked_action'  
        verbose_name = 'Liked Action'
        verbose_name_plural = 'Liked Actions'
        unique_together = ('user', 'action_id')  