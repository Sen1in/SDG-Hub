# backend/apps/analytics/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import UserBehavior, ClickCount

from django.utils import timezone
from datetime import timedelta, datetime
import pytz
from collections import Counter
import json
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Try to import and configure Redis
try:
    import redis
    from django.conf import settings
    
    # Initialize Redis connection
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    REDIS_AVAILABLE = True
except (ImportError, Exception) as e:
    REDIS_AVAILABLE = False
    logger.warning(f"Redis not available or connection failed: {e}")

# ===================================================================
#  Existing Tracking Views (No changes needed)
# ===================================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def track_search(request):
    user_id = request.data.get("userId")
    query = request.data.get("query")
    filters = request.data.get("filters", {})

    if not user_id or not query:
        return Response({"error": "Missing userId or query"}, status=400)

    UserBehavior.objects.create(
        user_id=user_id,
        type="search",
        detail={"query": query, "filters": filters}
    )

    return Response({"status": "ok"})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_page(request):
    data = request.data
    user_id = data.get('userId')
    path = data.get('path')

    if user_id and path:
        UserBehavior.objects.create(
            user_id=user_id,
            type='visit',
            detail={'path': path}
        )
        return Response({'status': 'ok'})
    else:
        return Response({'error': 'Missing userId or path'}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_click(request):
    content_type = request.data.get('contentType')
    object_id = request.data.get('objectId')

    if not content_type or not object_id:
        return Response({'error': 'Missing contentType or objectId'}, status=400)

    obj, created = ClickCount.objects.get_or_create(
        content_type=content_type,
        object_id=object_id,
    )
    obj.click_count += 1
    obj.save()

    return Response({'status': 'ok'})

@api_view(['GET'])
def popular_search_terms(request):
    cache_key = "popular_search_terms_7_days"
    
    if REDIS_AVAILABLE:
        try:
            cached_result = redis_client.get(cache_key)
            if cached_result:
                # check TTL
                ttl = redis_client.ttl(cache_key)
                
                if ttl > 0:
                    cached_data = json.loads(cached_result)
                    return Response(cached_data)
                else:
                    redis_client.delete(cache_key) 
        except Exception as e:
            logger.warning(f"Redis cache read failed: {e}")
    
    end_date = timezone.now()
    start_date = end_date - timedelta(days=7) 
    
    search_behaviors = UserBehavior.objects.filter(
        type='search',
        timestamp__range=[start_date, end_date]
    ).values('detail', 'timestamp')
    
    search_terms = []
    for behavior in search_behaviors:
        query = behavior['detail'].get('query', '').strip()
        if query and len(query) >= 2:  
            search_terms.append(query.lower())
    
    term_counts = Counter(search_terms)
    popular_terms = [{'term': term, 'count': count} for term, count in term_counts.most_common(10)]
     
    if REDIS_AVAILABLE:
        try:
            cache_duration = 60  # 1 minute
            redis_client.setex(cache_key, cache_duration, json.dumps(popular_terms))
        except Exception as e:
            logger.warning(f"Redis cache write failed: {e}")
    
    return Response(popular_terms)

@api_view(['GET'])
def get_popular_content(request):
    edu_items = ClickCount.objects.filter(content_type='education').order_by('-click_count')[:2]
    action_items = ClickCount.objects.filter(content_type='action').order_by('-click_count')[:2]

    data = {
        "education": [{"id": item.object_id, "count": item.click_count} for item in edu_items],
        "action": [{"id": item.object_id, "count": item.click_count} for item in action_items]
    }
    return Response(data)

# ===================================================================
#  Existing Analytics View 
# ===================================================================

class ActiveUserStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, format=None):
        # Gets the time zone set for the current project
        current_tz = timezone.get_current_timezone()
        
        # Explicitly convert the current time to the current timezone and then get the date
        today = timezone.now().astimezone(current_tz).date()
        
        # Get the first day of the month
        month_start = today.replace(day=1)
        
        total_users = User.objects.count()
        
        # Create a date range based on the correct "today"
        start_date = today - timedelta(days=29)
        date_range = [start_date + timedelta(days=i) for i in range(30)]
        stats_dict = {day.strftime('%Y-%m-%d'): 0 for day in date_range}

        # Get login records for the past 30 days
        recent_logins = User.objects.filter(
            last_login__gte=start_date
        ).values_list('last_login', flat=True)

        # Count the number of logins per day and handle time zones correctly in Python
        login_dates = [login_time.astimezone(current_tz).date() for login_time in recent_logins if login_time]
        daily_counts = Counter(login_dates)
        
        # Populate our date dictionary with the actual data
        for day, count in daily_counts.items():
            day_str = day.strftime('%Y-%m-%d')
            if day_str in stats_dict:
                stats_dict[day_str] = count
        
        # The data for today and this month are extracted from the statistical dictionary
        today_str = today.strftime('%Y-%m-%d')
        today_active_users = stats_dict.get(today_str, 0)
        
        # Count active users for the month (from the first day of the month to today)
        this_month_active_users = 0
        for day_str, count in stats_dict.items():
            day_date = datetime.strptime(day_str, '%Y-%m-%d').date()
            if day_date >= month_start:
                this_month_active_users += count

        stats_data = {
            'total_users': total_users,
            'today_active_users': today_active_users,
            'this_month_active_users': this_month_active_users,
        }
        return Response(stats_data)


class ActiveTrendChartView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        current_tz = timezone.get_current_timezone()
        

        today = timezone.now().astimezone(current_tz).date()
        
        start_date = today - timedelta(days=29)
        date_range = [start_date + timedelta(days=i) for i in range(30)]
        stats_dict = {day.strftime('%Y-%m-%d'): 0 for day in date_range}

        recent_logins = User.objects.filter(
            last_login__gte=start_date
        ).values_list('last_login', flat=True)

        login_dates = [login_time.astimezone(current_tz).date() for login_time in recent_logins if login_time]
        daily_counts = Counter(login_dates)
        
        for day, count in daily_counts.items():
            day_str = day.strftime('%Y-%m-%d')
            if day_str in stats_dict:
                stats_dict[day_str] = count
        
        result = [{'date': date, 'count': count} for date, count in sorted(stats_dict.items())]

        return Response(result)
    

# ===================================================================
# Word cloud chart 
# ===================================================================
@api_view(['GET'])
@permission_classes([IsAdminUser])
def search_terms_word_cloud(request):

    search_behaviors = UserBehavior.objects.filter(type='search').values('detail')
    
    search_terms = []
    for behavior in search_behaviors:
        query = behavior['detail'].get('query', '').strip().lower()
        if query and len(query) > 1:
            search_terms.append(query)
            
    if not search_terms:
        return Response([])

    term_counts = Counter(search_terms)
    
    word_cloud_data = [
        {'text': term, 'value': count} 
        for term, count in term_counts.most_common(50)
    ]
    
    return Response(word_cloud_data)

# ===================================================================
# Page activity time
# ===================================================================
@api_view(['GET'])
@permission_classes([IsAdminUser])
def page_active_time(request):
    """
    Count the active time and the number of visits for each page
    Support hierarchical display: separately count the parent page and the child page
    """
    from django.db.models import Count, Sum
    from django.db.models.functions import ExtractHour
    
    # Obtain the data for the past 30 days
    end_date = timezone.now()
    start_date = end_date - timedelta(days=30)
    
    # Query page access history
    page_visits = UserBehavior.objects.filter(
        type='visit',
        timestamp__range=[start_date, end_date]
    ).values('detail__path').annotate(
        visit_count=Count('id'),
        active_time=Count('id') * 5  
    )
    
    page_data = []
    parent_pages = {} 
    
    for visit in page_visits:
        path = visit['detail__path']
        if path:
            clean_path = path.lstrip('/')
            path_parts = clean_path.split('/') if clean_path else []
            
            if not path_parts or path_parts[0] == '':
                # Homepage
                page_name = 'Home'
                page_type = 'home'
                is_parent = True
                parent_key = 'home'
            else:
                main_section = path_parts[0].lower()
                
                # Page name mapping
                page_name_mapping = {
                    'actions': 'Actions',
                    'education': 'Education', 
                    'keywords': 'Keywords',
                    'search': 'Search',
                    'team': 'Team',
                    'profile': 'User Profile',
                    'analyze': 'Analytics',
                    'form': 'Forms',
                    'liked': 'Liked Items',
                    'login': 'Login',
                    'register': 'Register',
                    'terms': 'Terms & Conditions'
                }
                
                parent_name = page_name_mapping.get(main_section, main_section.title())
                
                if len(path_parts) == 1:
                    # Parent page (list page)
                    page_name = parent_name
                    page_type = main_section
                    is_parent = True
                    parent_key = main_section
                else:
                    if len(path_parts) >= 2:
                        page_id = path_parts[1]
                        
                        if main_section == 'actions':
                            page_name = f"Action #{page_id}"
                        elif main_section == 'education':
                            page_name = f"Education #{page_id}"
                        elif main_section == 'team':
                            if len(path_parts) >= 3 and path_parts[2] == 'forms':
                                if len(path_parts) >= 4:
                                    page_name = f"Team {page_id} - Form #{path_parts[3]}"
                                else:
                                    page_name = f"Team {page_id} - Forms"
                            else:
                                page_name = f"Team #{page_id}"
                        elif main_section == 'keywords':
                            page_name = f"Keyword: {page_id}"
                        elif main_section == 'profile':
                            page_name = f"Profile: {page_id}"
                        else:
                            page_name = f"{parent_name} #{page_id}"
                    else:
                        page_name = f"{parent_name} - Detail"
                    
                    page_type = f"{main_section}_detail"
                    is_parent = False
                    parent_key = main_section
            
            page_info = {
                'page_name': page_name,
                'page_type': page_type,
                'path': path,
                'is_parent': is_parent,
                'parent_key': parent_key,
                'active_time': visit['active_time'],
                'visit_count': visit['visit_count']
            }
            
            page_data.append(page_info)
            
            # Aggregate data from the parent page
            if parent_key not in parent_pages:
                parent_pages[parent_key] = {
                    'page_name': page_name_mapping.get(parent_key, parent_key.title()) if parent_key != 'home' else 'Home',
                    'page_type': parent_key,
                    'is_parent': True,
                    'active_time': 0,
                    'visit_count': 0,
                    'children': []
                }
            
            if is_parent:
                # Directly update the data of the parent page
                parent_pages[parent_key]['active_time'] += visit['active_time']
                parent_pages[parent_key]['visit_count'] += visit['visit_count']
            else:
                # Add to the subpage list
                parent_pages[parent_key]['children'].append(page_info)
                parent_pages[parent_key]['active_time'] += visit['active_time']
                parent_pages[parent_key]['visit_count'] += visit['visit_count']
    
    # Build the final hierarchical data structure
    final_data = []
    for parent_key, parent_info in parent_pages.items():
        # Sort sub-pages by active time
        parent_info['children'].sort(key=lambda x: x['active_time'], reverse=True)
        final_data.append(parent_info)
    
    # Sort the parent pages by active time
    final_data.sort(key=lambda x: x['active_time'], reverse=True)
    
    return Response(final_data)