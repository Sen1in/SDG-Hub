from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Count, F
from django.db.models.functions import Lower
from collections import defaultdict
from .models import KeywordResource, KeywordLike
from .serializers import KeywordResourceSerializer, KeywordStatsSerializer
import re
import math

class KeywordPagination(PageNumberPagination):
    """自定义分页"""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class KeywordResourceListView(generics.ListAPIView):
    """关键词资源列表视图 - 修改为分组返回"""
    serializer_class = KeywordResourceSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = KeywordResource.objects.all()
        
        # 搜索关键词
        search = self.request.query_params.get('search')
        if search:
            search_clean = re.sub(r'[^\w\s-]', '', search.lower().strip())
            queryset = queryset.filter(keyword__icontains=search_clean)
        
        # SDG筛选
        sdg_params = self.request.query_params.getlist('sdg')
        if sdg_params:
            sdg_numbers = [int(sdg) for sdg in sdg_params if sdg.isdigit()]
            if sdg_numbers:
                queryset = queryset.filter(sdg_number__in=sdg_numbers)
        
        # Target Code筛选
        target_code = self.request.query_params.get('target_code')
        if target_code:
            queryset = queryset.filter(target_code__icontains=target_code)
        
        return queryset.select_related().order_by('keyword', 'sdg_number', 'target_code')

    def list(self, request, *args, **kwargs):
        """重写list方法，实现分组分页"""
        queryset = self.get_queryset()
        
        # 如果没有搜索条件，返回空结果（避免加载太多数据）
        search = request.query_params.get('search')
        sdg_params = request.query_params.getlist('sdg')
        target_code = request.query_params.get('target_code')
        
        if not search and not sdg_params and not target_code:
            return Response({
                'count': 0,
                'next': None,
                'previous': None,
                'results': []
            })
        
        # 按关键词分组
        keyword_groups = defaultdict(list)
        for resource in queryset:
            keyword_groups[resource.keyword.lower()].append(resource)
        
        # 转换为分组结果格式
        grouped_results = []
        for keyword_text, resources in keyword_groups.items():
            # 为每个分组创建一个代表性的对象
            representative = resources[0]  # 使用第一个作为代表
            
            # 收集所有相关的targets
            targets_info = []
            seen_combinations = set()
            
            for resource in resources:
                combination = (resource.sdg_number, resource.target_code)
                if combination not in seen_combinations:
                    targets_info.append({
                        'sdg_number': resource.sdg_number,
                        'target_code': resource.target_code,
                        'sdg_title': self.get_sdg_title(resource.sdg_number)
                    })
                    seen_combinations.add(combination)
            
            # 创建分组结果对象
            grouped_result = {
                'id': representative.id,
                'keyword': representative.keyword,
                'sdg_number': representative.sdg_number,  # 主要SDG
                'target_code': representative.target_code,  # 主要target
                'target_description': representative.target_description,
                'reference1': representative.reference1,
                'reference2': representative.reference2,
                'note': representative.note,
                'sdg_title': self.get_sdg_title(representative.sdg_number),
                'is_liked': False,  # 暂时设为False
                'created_at': representative.created_at,
                # 新增字段：所有相关的targets
                'all_targets': targets_info,
                'target_count': len(targets_info)
            }
            
            grouped_results.append(grouped_result)
        
        # 按关键词排序
        grouped_results.sort(key=lambda x: x['keyword'].lower())
        
        # 手动分页
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        
        total_count = len(grouped_results)
        total_pages = math.ceil(total_count / page_size) if total_count > 0 else 1
        
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_results = grouped_results[start_idx:end_idx]
        
        # 构建分页URL
        def build_page_url(page_num):
            params = []
            if search:
                params.append(f'search={search}')
            for sdg in sdg_params:
                params.append(f'sdg={sdg}')
            if target_code:
                params.append(f'target_code={target_code}')
            params.append(f'page={page_num}')
            params.append(f'page_size={page_size}')
            return '?' + '&'.join(params)
        
        has_next = page < total_pages
        has_previous = page > 1
        
        return Response({
            'count': total_count,
            'next': build_page_url(page + 1) if has_next else None,
            'previous': build_page_url(page - 1) if has_previous else None,
            'results': paginated_results
        })
    
    def get_sdg_title(self, sdg_number):
        """获取SDG标题"""
        sdg_titles = {
            1: 'No Poverty', 2: 'Zero Hunger', 3: 'Good Health and Well-being', 
            4: 'Quality Education', 5: 'Gender Equality', 6: 'Clean Water and Sanitation',
            7: 'Affordable and Clean Energy', 8: 'Decent Work and Economic Growth',
            9: 'Industry, Innovation and Infrastructure', 10: 'Reduced Inequalities',
            11: 'Sustainable Cities and Communities', 12: 'Responsible Consumption and Production',
            13: 'Climate Action', 14: 'Life Below Water', 15: 'Life on Land',
            16: 'Peace, Justice and Strong Institutions', 17: 'Partnerships for the Goals'
        }
        return sdg_titles.get(sdg_number, f'SDG {sdg_number}')

class KeywordResourceDetailView(generics.RetrieveAPIView):
    """关键词资源详情视图"""
    queryset = KeywordResource.objects.all()
    serializer_class = KeywordResourceSerializer
    permission_classes = [AllowAny]

@api_view(['GET'])
@permission_classes([AllowAny])
def keyword_stats(request):
    """获取关键词统计信息"""
    # 基础统计
    total_keywords = KeywordResource.objects.count()
    unique_keywords = KeywordResource.objects.values('keyword').distinct().count()
    
    # SDG分布
    sdg_distribution = {}
    sdg_counts = KeywordResource.objects.values('sdg_number').annotate(
        count=Count('id')
    ).order_by('sdg_number')
    
    for item in sdg_counts:
        sdg_key = f"sdg_{item['sdg_number']}"
        sdg_distribution[sdg_key] = item['count']
    
    # Target分布（前20个最常见的）
    target_distribution = {}
    target_counts = KeywordResource.objects.values('target_code').annotate(
        count=Count('id')
    ).order_by('-count')[:20]
    
    for item in target_counts:
        target_distribution[item['target_code']] = item['count']
    
    # 筛选选项
    filter_options = {
        'sdgs': [
            {'value': i, 'label': f'SDG {i}'} for i in range(1, 18)
        ],
        'target_codes': list(KeywordResource.objects.values_list(
            'target_code', flat=True
        ).distinct().order_by('target_code')),
    }
    
    data = {
        'total_keywords': total_keywords,
        'unique_keywords': unique_keywords,
        'sdg_distribution': sdg_distribution,
        'target_distribution': target_distribution,
        'filter_options': filter_options
    }
    
    serializer = KeywordStatsSerializer(data)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def keyword_search(request):
    """关键词搜索 - 按关键词分组"""
    query = request.GET.get('q', '').strip()
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 20))
    
    if not query or len(query) < 2:
        return Response({
            'results': [],
            'count': 0,
            'next': None,
            'previous': None
        })
    
    # 搜索匹配的关键词资源
    search_clean = re.sub(r'[^\w\s-]', '', query.lower().strip())
    resources = KeywordResource.objects.filter(
        keyword__icontains=search_clean
    ).select_related()
    
    # 按关键词分组
    keyword_groups = defaultdict(list)
    for resource in resources:
        keyword_groups[resource.keyword.lower()].append({
            'id': resource.id,
            'sdg_number': resource.sdg_number,
            'target_code': resource.target_code,
            'target_description': resource.target_description,
            'sdg_title': KeywordResourceSerializer().get_sdg_title(resource)
        })
    
    # 转换为搜索结果格式
    results = []
    for keyword, targets in keyword_groups.items():
        results.append({
            'keyword': targets[0]['id'],  # 使用第一个资源的ID作为标识
            'keyword_text': keyword,
            'related_targets': targets,
            'target_count': len(targets)
        })
    
    # 按关键词排序
    results.sort(key=lambda x: x['keyword_text'])
    
    # 手动分页
    total_count = len(results)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_results = results[start_idx:end_idx]
    
    # 构建分页响应
    has_next = end_idx < total_count
    has_previous = page > 1
    
    return Response({
        'results': paginated_results,
        'count': total_count,
        'next': f'?q={query}&page={page + 1}&page_size={page_size}' if has_next else None,
        'previous': f'?q={query}&page={page - 1}&page_size={page_size}' if has_previous else None
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def keyword_detail(request, keyword):
    """获取特定关键词的所有相关目标"""
    # URL解码
    from urllib.parse import unquote
    keyword_decoded = unquote(keyword)
    
    resources = KeywordResource.objects.filter(
        keyword__iexact=keyword_decoded
    ).select_related().order_by('sdg_number', 'target_code')
    
    if not resources.exists():
        # 尝试模糊匹配
        resources = KeywordResource.objects.filter(
            keyword__icontains=keyword_decoded
        ).select_related().order_by('sdg_number', 'target_code')[:10]
    
    serializer = KeywordResourceSerializer(
        resources, 
        many=True, 
        context={'request': request}
    )
    
    return Response({
        'keyword': keyword_decoded,
        'targets': serializer.data,
        'total_targets': len(serializer.data)
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def keyword_autocomplete(request):
    """关键词自动完成"""
    query = request.GET.get('q', '').strip()
    
    if len(query) < 2:
        return Response({'suggestions': []})
    
    # 搜索匹配的关键词
    search_clean = re.sub(r'[^\w\s-]', '', query.lower().strip())
    suggestions = KeywordResource.objects.filter(
        keyword__icontains=search_clean
    ).values_list('keyword', flat=True).distinct()[:10]
    
    return Response({
        'suggestions': list(suggestions)
    })

# 收藏相关视图
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_keyword(request, keyword_id):
    """收藏关键词"""
    try:
        keyword_resource = KeywordResource.objects.get(id=keyword_id)
        like, created = KeywordLike.objects.get_or_create(
            user=request.user,
            keyword_resource=keyword_resource
        )
        return Response({'liked': True, 'created': created})
    except KeywordResource.DoesNotExist:
        return Response({'error': 'Keyword not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unlike_keyword(request, keyword_id):
    """取消收藏关键词"""
    try:
        keyword_resource = KeywordResource.objects.get(id=keyword_id)
        deleted_count, _ = KeywordLike.objects.filter(
            user=request.user,
            keyword_resource=keyword_resource
        ).delete()
        return Response({'liked': False, 'deleted': deleted_count > 0})
    except KeywordResource.DoesNotExist:
        return Response({'error': 'Keyword not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liked_keywords(request):
    """获取用户收藏的关键词"""
    likes = KeywordLike.objects.filter(user=request.user).select_related('keyword_resource')
    keyword_ids = [like.keyword_resource.id for like in likes]
    return Response({'liked_keyword_ids': keyword_ids})