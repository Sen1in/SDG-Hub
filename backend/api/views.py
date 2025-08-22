# backend/api/views.py

from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from django.db.models import Count
from django.db.models.functions import TruncDate

@api_view(['GET'])
def health_check(request):

    return Response({
        'status': 'healthy',
        'message': 'SDG Knowledge System API is running',
        'version': '1.0.0'
    })

@api_view(['GET'])
def api_info(request):

    return Response({
        'name': 'SDG Knowledge System API',
        'version': '1.0.0',
        'description': 'API for the SDG Knowledge System',
        'endpoints': {
            'health': '/api/v1/health/',
            'info': '/api/v1/info/',
            'auth': '/api/auth/',
            'education': '/api/education/',
            'actions': '/api/actions/',
            'keywords': '/api/keywords/',
            'analytics': '/api/analytics/',
            'team': '/api/team/',
        }
    })

def home(request):

    return JsonResponse({
        'message': 'Welcome to SDG Knowledge System API',
        'frontend_url': 'http://localhost:3000',
        'api_docs': '/api/v1/info/'
    })


class ActiveTrendChartView(APIView):
    """
    Provide an API view of the daily active user data for the past 30 days.
    """
    def get(self, request, *args, **kwargs):
        # Set the time range
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)

        # Query the database and group and count the values of the "last_login" field by day.
        queryset = (
            User.objects
            .filter(last_login__gte=start_date)
            .annotate(date=TruncDate('last_login'))
            .values('date')
            .annotate(count=Count('id', distinct=True))
            .order_by('date')
        )

        # Create a dictionary that includes all the dates within the past 30 days, and initialize the active count to 0.
        date_range = [start_date.date() + timedelta(days=i) for i in range(31)]
        stats_dict = {day.strftime('%Y-%m-%d'): 0 for day in date_range}

        # Update the dictionary with the retrieved data
        for entry in queryset:
            date_str = entry['date'].strftime('%Y-%m-%d')
            stats_dict[date_str] = entry['count']

        # Convert the dictionary into the final list format.
        result = [{'date': date, 'count': count} for date, count in stats_dict.items()]

        return Response(result)