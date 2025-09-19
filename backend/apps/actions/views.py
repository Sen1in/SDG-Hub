from rest_framework import generics, status, filters
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Count
from django.http import JsonResponse
import re
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q

from .models import ActionDb, LikedAction
from .serializers import ActionDbSerializer, ActionDbListSerializer

from .models import ActionDb, LEVEL_CHOICES, INDIVIDUAL_ORGANIZATION_CHOICES, INDUSTRY_CHOICES
from .serializers import (
    ActionDbSerializer, 
    ActionDbListSerializer,
    ActionSearchSerializer
)

class ActionPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class ActionListView(generics.ListAPIView):
    serializer_class = ActionDbListSerializer
    pagination_class = ActionPagination

    def get_queryset(self):
        queryset = ActionDb.objects.all()
        
        # Basic Search - Titles and Details
        search = self.request.query_params.get('search', None)
        if search:
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
                        Q(actions__icontains=variant) |
                        Q(action_detail__icontains=variant) |
                        Q(additional_notes__icontains=variant)
                    )
                
                query &= word_query
            queryset = queryset.filter(query)
        
        # SDG Filtering
        sdg = self.request.query_params.getlist('sdg')
        if sdg:
            sdg_query = Q()
            for sdg_num in sdg:
                if sdg_num.isdigit():
                    sdg_int = int(sdg_num)
                    if sdg_int == 1:
                        sdg_query |= Q(field_sdgs__startswith='1,') | Q(field_sdgs__exact='1')
                    elif sdg_int < 10:
                        sdg_query |= Q(field_sdgs__contains=f',{sdg_num},') | Q(field_sdgs__endswith=f',{sdg_num}')
                    else:
                        sdg_query |= Q(field_sdgs__contains=str(sdg_num))
                    
                    sdg_query |= Q(field_sdgs__contains='18')
            
            queryset = queryset.filter(sdg_query)
        
        # Level Filtering
        level = self.request.query_params.getlist('level')
        if level:
            level_query = Q()
            for level_num in level:
                if level_num.isdigit():
                    level_query |= (
                        Q(level__exact=level_num) |
                        Q(level__regex=f'^{level_num}\\s*,') |
                        Q(level__regex=f',\\s*{level_num}\\s*,') |
                        Q(level__regex=f',\\s*{level_num}$')
                    )
            
            queryset = queryset.filter(level_query)
        
        # individual_organization Filtering
        individual_organization = self.request.query_params.getlist('individual_organization')
        if individual_organization:
            io_ints = [int(io) for io in individual_organization if io.isdigit()]
            if io_ints:
                queryset = queryset.filter(individual_organization__in=io_ints)
        
        # location Filtering
        location = self.request.query_params.get('location', None)
        if location:
            queryset = queryset.filter(
                location_specific_actions_org_onlyonly_field__icontains=location
            )
        
        # industry filtering
        industry = self.request.query_params.get('industry', None)
        if industry:
            queryset = queryset.filter(
                related_industry_org_only_field__icontains=industry
            )
        
        # digital_actions
        digital_actions = self.request.query_params.get('digital_actions', None)
        if digital_actions and digital_actions.isdigit():
            queryset = queryset.filter(digital_actions=int(digital_actions))
        
        # award
        award = self.request.query_params.get('award', None)
        if award and award.isdigit():
            queryset = queryset.filter(award=int(award))
        
        return queryset.distinct()

class ActionDetailView(generics.RetrieveAPIView):
    """Action Resource Details API"""
    queryset = ActionDb.objects.all()
    serializer_class = ActionDbSerializer
    lookup_field = 'id'

@api_view(['GET'])
def action_stats(request):
    """
    Action Statistics Information API
    """
    queryset = ActionDb.objects.all()
    total_resources = queryset.count()
    
    sdg_count = [0] * 18 
    
    for item in queryset:
        if item.field_sdgs:
            item_sdg_string = str(item.field_sdgs)
            item_sdg_list = re.split(r"\'| |\]|\[|,|\.|\;", item_sdg_string)
            
            for e in item_sdg_list:
                if e.strip() and e.strip().isdigit():
                    e_int = int(e.strip())
                    if 1 <= e_int <= 17:
                        sdg_count[e_int] += 1
                    elif e_int == 18:  
                        for i in range(1, 18):
                            sdg_count[i] += 1
    
    sdg_distribution = {f'sdg_{i}': sdg_count[i] for i in range(1, 18)}
    
    level_stats = {}
    for level_num, level_label in LEVEL_CHOICES:
        count = queryset.filter(level=level_num).count()
        level_stats[f'level_{level_num}'] = count
    
    io_stats = {}
    for io_num, io_label in INDIVIDUAL_ORGANIZATION_CHOICES:
        count = queryset.filter(individual_organization=io_num).count()
        io_stats[f'io_{io_num}'] = count
    
    digital_yes = queryset.filter(digital_actions=0).count()
    digital_no = queryset.filter(digital_actions=1).count()
    
    award_yes = queryset.filter(award=1).count()
    award_no = queryset.filter(award=0).count()
    
    latest_resources = queryset.order_by('-id')[:5]
    latest_serializer = ActionDbListSerializer(latest_resources, many=True)
    
    return Response({
        'total_resources': total_resources,
        'sdg_distribution': sdg_distribution,
        'level_distribution': level_stats,
        'individual_organization_distribution': io_stats,
        'digital_actions_stats': {
            'digital_yes': digital_yes,
            'digital_no': digital_no
        },
        'award_stats': {
            'award_yes': award_yes,
            'award_no': award_no
        },
        'latest_resources': latest_serializer.data,
        'filter_options': get_filter_options()
    })

@api_view(['GET'])
def action_filters(request):
    return Response(get_filter_options())

def get_filter_options():
    return {
        'sdgs': [
            {'value': i, 'label': f'SDG {i}'} 
            for i in range(1, 18)
        ],
        'levels': [
            {'value': level_num, 'label': level_label}
            for level_num, level_label in LEVEL_CHOICES
        ],
        'individual_organization': [
            {'value': io_num, 'label': io_label}
            for io_num, io_label in INDIVIDUAL_ORGANIZATION_CHOICES
        ],
        'digital_actions': [
            {'value': 0, 'label': 'YES'},
            {'value': 1, 'label': 'NO'}
        ],
        'award': [
            {'value': 0, 'label': 'No'},
            {'value': 1, 'label': 'Yes'}
        ],
        'industries': INDUSTRY_CHOICES,
        'regions': [
            'Australia', 'United States', 'New Zealand', 'United Kingdom',
            'Italy', 'Spain', 'Global', 'China', 'Canada', 'India'
        ]
    }

@api_view(['GET'])
def action_by_sdg(request, sdg_number):
    if not (1 <= sdg_number <= 17):
        return Response(
            {'error': 'SDG number must be between 1 and 17'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    queryset = ActionDb.objects.all()
    
    if sdg_number == 1:
        sdg_query = Q(field_sdgs__startswith='1,') | Q(field_sdgs__exact='1')
    elif sdg_number < 10:
        sdg_query = Q(field_sdgs__contains=f',{sdg_number},') | Q(field_sdgs__endswith=f',{sdg_number}')
    else:
        sdg_query = Q(field_sdgs__contains=str(sdg_number))
    
    sdg_query |= Q(field_sdgs__contains='18')
    
    queryset = queryset.filter(sdg_query)
    
    paginator = ActionPagination()
    page = paginator.paginate_queryset(queryset, request)
    
    if page is not None:
        serializer = ActionDbListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = ActionDbListSerializer(queryset, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def action_by_level(request, level_number):
    if not (1 <= level_number <= 6):
        return Response(
            {'error': 'Level number must be between 1 and 6'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    queryset = ActionDb.objects.filter(level=level_number)
    
    paginator = ActionPagination()
    page = paginator.paginate_queryset(queryset, request)
    
    if page is not None:
        serializer = ActionDbListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = ActionDbListSerializer(queryset, many=True)
    return Response(serializer.data)

class LikeActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        action_id = request.data.get('action_id')
        if not action_id:
            return Response({'error': 'action_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        LikedAction.objects.get_or_create(user=request.user, action_id=action_id)
        return Response({'status': 'liked'})

    def delete(self, request):
        action_id = request.data.get('action_id')
        if not action_id:
            return Response({'error': 'action_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        LikedAction.objects.filter(user=request.user, action_id=action_id).delete()
        return Response({'status': 'unliked'})


class ListLikedActionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        liked_ids = LikedAction.objects.filter(user=request.user).values_list('action_id', flat=True)
        return Response({'liked_ids': list(liked_ids)})


class LikedActionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        liked_ids = LikedAction.objects.filter(user=request.user).values_list('action_id', flat=True)
        resources = ActionDb.objects.filter(id__in=liked_ids)
        serializer = ActionDbListSerializer(resources, many=True)
        return Response(serializer.data)