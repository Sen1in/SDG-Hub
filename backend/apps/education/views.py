from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Count, Case, When, Value, CharField, TextField
from django.db.models.functions import Replace
from django.http import JsonResponse
import re
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import LikedEducation
from .serializers import LikedEducationSerializer
from django.shortcuts import get_object_or_404

from .models import EducationDb
from .serializers import (
    EducationDbSerializer, 
    EducationDbListSerializer,
    EducationSearchSerializer
)

def get_sort_key(title):
    """Custom sorting function to handle non-alphabetic characters at the beginning of titles"""
    if not title:
        return 'zzz'
    
    # Remove leading non-alphabetic characters
    cleaned = re.sub(r'^[^A-Za-z]*', '', title)
    if cleaned:
        return cleaned[0].upper()
    return 'zzz'

class EducationPagination(PageNumberPagination):
    """Custom pagination"""
    page_size = 20  
    page_size_query_param = 'page_size'
    max_page_size = 100

class EducationListView(generics.ListAPIView):
    """
    Education Resource List API - Function based on the master project
    """
    serializer_class = EducationDbListSerializer
    pagination_class = EducationPagination

    def get_queryset(self):
        queryset = EducationDb.objects.all()
        
        # Basic Search - Titles and DescriptionsBasic Search - Titles and Descriptions
        search = self.request.query_params.get('search', None)
        if search:
            # Part-of-speech search - The logic is the same as that of the master project
            query = Q()
            for keyword in search.strip().lower().split():
                word_query = Q()
                
                variants = [keyword]
                
                if any(quote in keyword for quote in ["'", "’", "‘", "´", "`"]):
                    base_word = keyword
                    for old_quote in ["'", "’", "‘", "´", "`"]:
                        for new_quote in ["'", "’", "‘", "´", "`"]:
                            variants.append(base_word.replace(old_quote, new_quote))
                
                variants = list(set(variants))
                
                for variant in variants:
                    word_query |= (
                        Q(title__icontains=variant) |
                        Q(description__icontains=variant) |
                        Q(aims__icontains=variant)
                    )
                
                query &= word_query
            queryset = queryset.filter(query)
        
        # SDG filtering - Complex logic based on the master project
        sdg = self.request.query_params.getlist('sdg')
        if sdg:
            for sdg_num in sdg:
                if sdg_num.isdigit():
                    queryset = queryset.annotate(
                        sdgs_no_space=Replace(
                            'sdgs_related', 
                            Value(' '), 
                            Value(''), 
                            output_field=TextField()
                        )
                    ).filter(
                        Q(sdgs_no_space__exact=sdg_num) |
                        Q(sdgs_no_space__startswith=f'{sdg_num},') |
                        Q(sdgs_no_space__contains=f',{sdg_num},') |
                        Q(sdgs_no_space__endswith=f',{sdg_num}') |
                        Q(sdgs_no_space__contains='18')
                    )
        
        # Year filtering
        year = self.request.query_params.getlist('year')
        if year:
            queryset = queryset.filter(year__in=year)
        
        # Location filtering
        location = self.request.query_params.get('location', None)
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        # Organization filtering
        organization = self.request.query_params.get('organization', None)
        if organization:
            queryset = queryset.filter(organization__icontains=organization)
        
        # Discipline filtering
        discipline = self.request.query_params.get('discipline', None)
        if discipline:
            queryset = queryset.filter(related_to_which_discipline__icontains=discipline)
        
        # Industry filtering
        industry = self.request.query_params.get('industry', None)
        if industry:
            queryset = queryset.filter(useful_for_which_industries__icontains=industry)
        
        queryset = queryset.annotate(
            first_letter=Case(
                When(title__regex=r'^[0-9]', then=Value('9_')), 
                When(title__regex=r'^[^A-Za-z0-9]', then=Value('Z_')),
                default=Value(''),
                output_field=CharField()
            )
        ).order_by('first_letter', 'title')
        
        return queryset.distinct()

class EducationDetailView(generics.RetrieveAPIView):
    """Education Resource Details APIEducation Resource Details API"""
    queryset = EducationDb.objects.all()
    serializer_class = EducationDbSerializer
    lookup_field = 'id'

@api_view(['GET'])
def education_stats(request):
    """
    Education Statistical Information API - Statistical logic based on the master project
    """
    # Obtain the current filtered dataset
    queryset = EducationDb.objects.all()
    total_resources = queryset.count()
    
    # SDG Distribution Statistics - Using the Logic of the Master Project
    sdg_count = [0] * 18 
    
    for item in queryset:
        if item.sdgs_related:
            item_sdg_string = str(item.sdgs_related)
            item_sdg_list = re.split(r"\'| |\]|\[|,|\.|\;", item_sdg_string)
            
            for e in item_sdg_list:
                if e.strip() and e.strip().isdigit():
                    e_int = int(e.strip())
                    if 1 <= e_int <= 17:
                        sdg_count[e_int] += 1
                    elif e_int == 18:  
                        for i in range(1, 18):
                            sdg_count[i] += 1
    
    # Build an SDG distribution dictionary
    sdg_distribution = {f'sdg_{i}': sdg_count[i] for i in range(1, 18)}
    
    # Latest resources
    latest_resources = queryset.order_by('-id')[:5]
    latest_serializer = EducationDbListSerializer(latest_resources, many=True)
    
    return Response({
        'total_resources': total_resources,
        'sdg_distribution': sdg_distribution,
        'latest_resources': latest_serializer.data,
        'filter_options': get_filter_options()
    })

@api_view(['GET'])
def education_filters(request):
    """Obtain filter options"""
    return Response(get_filter_options())

def get_filter_options():
    """Obtain all filter options - based on the selection of the master project"""
    return {
        'years': [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        'sdgs': [
            {'value': i, 'label': f'SDG {i}'} 
            for i in range(1, 18)
        ],
        'disciplines': [
            'Architecture and Building',
            'Business and Management', 
            'Creative Arts',
            'Education',
            'Engineering and Related Technologies',
            'Environmental and Related Studies',
            'Health',
            'Humanities and Law',
            'Information Technology',
            'Natural and Physical Sciences'
        ],
        'industries': [
            'Education and training',
            'Health care and social assistance',
            'Professional services',
            'Information media and telecommunications',
            'Financial and insurance services',
            'Public administration and safety',
            'Manufacturing',
            'Construction',
            'Agriculture forestry and fishing'
        ],
        'regions': [
            'Australia', 'United States', 'New Zealand', 'United Kingdom',
            'Italy', 'Spain', 'Global', 'China', 'Canada', 'India'
        ]
    }

@api_view(['GET'])
def education_by_sdg(request, sdg_number):
    """Obtain Education resources in accordance with SDG goals"""
    if not (1 <= sdg_number <= 17):
        return Response(
            {'error': 'SDG number must be between 1 and 17'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Use the same filtering logic as that of the list view
    queryset = EducationDb.objects.all()
    
    # Build SDG query
    if sdg_number == 1:
        sdg_query = Q(sdgs_related__startswith='1,') | Q(sdgs_related__exact='1')
    elif sdg_number < 10:
        sdg_query = Q(sdgs_related__contains=f',{sdg_number},') | Q(sdgs_related__endswith=f',{sdg_number}')
    else:
        sdg_query = Q(sdgs_related__contains=str(sdg_number))
    
    # Incorporating projects that support all of the SDGs
    sdg_query |= Q(sdgs_related__contains='18')
    
    queryset = queryset.filter(sdg_query).order_by('title')
    
    paginator = EducationPagination()
    page = paginator.paginate_queryset(queryset, request)
    
    if page is not None:
        serializer = EducationDbListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = EducationDbListSerializer(queryset, many=True)
    return Response(serializer.data)

class LikeEducationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        education_id = request.data.get('education_id')
        if not education_id:
            return Response({'error': 'education_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        LikedEducation.objects.get_or_create(user=request.user, education_id=education_id)
        return Response({'status': 'liked'})

    def delete(self, request):
        education_id = request.data.get('education_id')
        if not education_id:
            return Response({'error': 'education_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        LikedEducation.objects.filter(user=request.user, education_id=education_id).delete()
        return Response({'status': 'unliked'})

class ListLikedEducationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        liked_ids = LikedEducation.objects.filter(user=request.user).values_list('education_id', flat=True)
        return Response({'liked_ids': list(liked_ids)})
    
class LikedEducationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        liked_ids = LikedEducation.objects.filter(user=request.user).values_list('education_id', flat=True)
        resources = EducationDb.objects.filter(id__in=liked_ids)
        serializer = EducationDbListSerializer(resources, many=True)
        return Response(serializer.data)