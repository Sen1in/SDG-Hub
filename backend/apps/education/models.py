from django.db import models
import re
from django.contrib.auth.models import User

class EducationDb(models.Model):
    """
    Education database model - Based on actual database structure
    """
    id = models.AutoField(primary_key=True)  
    title = models.TextField(db_column='Title', blank=True, null=True)
    description = models.TextField(db_column='Description', blank=True, null=True)
    aims = models.TextField(db_column='Aims', blank=True, null=True)
    learning_outcome_expecting_outcome_field = models.TextField(db_column='Learning outcome( Expecting outcome)', blank=True, null=True)
    type_label = models.CharField(db_column='Type label', max_length=50, blank=True, null=True)
    location = models.CharField(db_column='Location', max_length=50, blank=True, null=True)
    organization = models.CharField(db_column='Organization', max_length=128, blank=True, null=True)
    year = models.CharField(db_column='Year', max_length=50, blank=True, null=True)  
    sdgs_related = models.TextField(db_column='SDGs related', blank=True, null=True)
    related_to_which_discipline = models.CharField(db_column='Related to which discipline', max_length=128, blank=True, null=True)
    useful_for_which_industries = models.TextField(db_column='Useful for which industries', blank=True, null=True)
    source = models.TextField(db_column='Source', blank=True, null=True)
    link = models.TextField(db_column='Link', blank=True, null=True)
    descriptions = models.TextField(blank=True, null=True)
    column14 = models.IntegerField(db_column='Column14', blank=True, null=True)
    column15 = models.CharField(db_column='Column15', max_length=50, blank=True, null=True)
    column16 = models.CharField(db_column='Column16', max_length=50, blank=True, null=True)
    
    class Meta:
        managed = False  
        db_table = 'education_db'
        verbose_name = 'Education Resource'
        verbose_name_plural = 'Education Resources'
        ordering = ['-id']
    
    def __str__(self):
        return self.title or f"Education Resource {self.id}"
    
    @property
    def sdgs_list(self):
        """Parse the SDG string and return the list of SDG numbers"""
        if not self.sdgs_related:
            return []
        

        sdg_list = []
        item_sdg_string = str(self.sdgs_related)
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
    def type_list(self):
        """Parse the list of type tags"""
        if not self.type_label:
            return []
        return [t.strip() for t in self.type_label.split(',') if t.strip()]
    
    @property
    def discipline_list(self):
        """List of Analytical Subjects"""
        if not self.related_to_which_discipline:
            return []
        return [d.strip() for d in self.related_to_which_discipline.split(',') if d.strip()]
    
    @property
    def industry_list(self):
        """List of Industry"""
        if not self.useful_for_which_industries:
            return []
        return [i.strip() for i in self.useful_for_which_industries.split(',') if i.strip()]

    @property
    def year_int(self):
        """Convert the year string to an integer"""
        if self.year and self.year.isdigit():
            return int(self.year)
        return None

    def get_absolute_url(self):
        return f"/education/{self.id}/"

class LikedEducation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    education_id = models.IntegerField()  
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'education_id')