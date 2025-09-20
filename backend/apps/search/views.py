from rest_framework.decorators import api_view  
from rest_framework.response import Response
from django.http import JsonResponse
from django.db import connection
from django.conf import settings
import math
import re
import os
import logging
from collections import defaultdict
from functools import lru_cache

logger = logging.getLogger(__name__)

# Import check functions (moved from module level to avoid startup issues)
def check_meilisearch():
    try:
        from meilisearch import Client
        from meilisearch.errors import MeilisearchError
        return True, Client, MeilisearchError
    except ImportError:
        return False, None, None

def check_symspell():
    try:
        from symspellpy import SymSpell, Verbosity
        return True, SymSpell, Verbosity
    except ImportError:
        return False, None, None

@api_view(['GET'])
def unified_search(request):
    query = request.GET.get('q', '').strip().lower()
    page = int(request.GET.get('page', 1))
    size = int(request.GET.get('size', 5))
    offset = (page - 1) * size

    sort = request.GET.get('sort', 'relevance')
    location = request.GET.get('location', '').strip().lower()
    sdg = request.GET.get('sdg', '').strip()
    source_filter = request.GET.get('source', '').strip().lower()

    filters = []
    filter_params = []

    if location:
        filters.append("LOWER(location) LIKE %s")
        filter_params.append(f"%{location}%")

    if sdg:
        sdg_list = [s.strip() for s in sdg.split(',') if s.strip().isdigit()]
        if '18' not in sdg_list:
            for s in sdg_list:
                filters.append("(sdgs REGEXP %s OR sdgs = '18')")
                filter_params.append(r'\b' + s + r'\b')

    if source_filter in ['education', 'actions', 'keywords']:
        filters.append("source = %s")
        filter_params.append(source_filter)

    where_clause = ""
    if filters:
        where_clause = "WHERE " + " AND ".join(filters)

    if sort == "title":
        sort_clause = "ORDER BY LOWER(TRIM(title)) ASC"
    elif sort == "sdg_count":
        sort_clause = """
            ORDER BY 
            CASE 
                WHEN TRIM(sdgs) = '18' THEN 17
                ELSE (LENGTH(sdgs) - LENGTH(REPLACE(sdgs, ',', '')) + 1)
            END DESC
        """
    else:
        sort_clause = "ORDER BY relevance DESC, LOWER(TRIM(title)) ASC"

    # Fixed query to correctly handle keyword merging
    raw_query = f"""
        SELECT * FROM (
            SELECT
                id,
                Title COLLATE utf8mb4_unicode_ci AS title,
                descriptions COLLATE utf8mb4_unicode_ci AS description,
                Organization COLLATE utf8mb4_unicode_ci AS organization,
                Year AS year,
                Link COLLATE utf8mb4_unicode_ci AS link,
                `SDGs related` COLLATE utf8mb4_unicode_ci AS sdgs,
                Location COLLATE utf8mb4_unicode_ci AS location,
                'education' AS source,
                MATCH(Title, descriptions) AGAINST (%s IN NATURAL LANGUAGE MODE) AS relevance
            FROM education_db
            WHERE MATCH(Title, descriptions) AGAINST (%s IN NATURAL LANGUAGE MODE)

            UNION ALL

            SELECT
                id,
                Actions COLLATE utf8mb4_unicode_ci AS title,
                `Action detail` COLLATE utf8mb4_unicode_ci AS description,
                CASE
                    WHEN `Individual/Organization` = 0 THEN 'individual'
                    WHEN `Individual/Organization` = 1 THEN 'organization'
                    ELSE ''
                END COLLATE utf8mb4_unicode_ci AS organization,
                '' AS year,
                `Source Links` COLLATE utf8mb4_unicode_ci AS link,
                ` SDGs` COLLATE utf8mb4_unicode_ci AS sdgs,
                `Location (specific actions/org onlyonly)` COLLATE utf8mb4_unicode_ci AS location,
                'actions' AS source,
                MATCH(Actions, `Action detail`) AGAINST (%s IN NATURAL LANGUAGE MODE) AS relevance
            FROM action_db
            WHERE MATCH(Actions, `Action detail`) AGAINST (%s IN NATURAL LANGUAGE MODE)

            UNION ALL

            SELECT
                MIN(id) AS id,
                keyword COLLATE utf8mb4_unicode_ci AS title,
                GROUP_CONCAT(DISTINCT reference1 ORDER BY reference1 SEPARATOR ' | ') COLLATE utf8mb4_unicode_ci AS description,
                GROUP_CONCAT(DISTINCT CASE WHEN target_code IS NOT NULL AND target_code != '' THEN target_code END ORDER BY CAST(SUBSTRING_INDEX(target_code, '.', 1) AS UNSIGNED), CAST(SUBSTRING_INDEX(target_code, '.', -1) AS UNSIGNED) SEPARATOR ', ') COLLATE utf8mb4_unicode_ci AS organization,
                '' AS year,
                '' AS link,
                GROUP_CONCAT(DISTINCT CASE WHEN sdg_number IS NOT NULL AND sdg_number != '' THEN sdg_number END ORDER BY CAST(sdg_number AS UNSIGNED) SEPARATOR ', ') COLLATE utf8mb4_unicode_ci AS sdgs,
                '' AS location,
                'keywords' AS source,
                MAX(MATCH(keyword) AGAINST (%s IN NATURAL LANGUAGE MODE)) AS relevance
            FROM keyword_resources
            WHERE MATCH(keyword) AGAINST (%s IN NATURAL LANGUAGE MODE)
            GROUP BY keyword
        ) AS combined
        {where_clause}
        {sort_clause}
        LIMIT %s OFFSET %s
    """

    # Fixed count query accordingly
    count_query = f"""
        SELECT COUNT(*) FROM (
            SELECT
                id,
                Title COLLATE utf8mb4_unicode_ci AS title,
                `SDGs related` COLLATE utf8mb4_unicode_ci AS sdgs,
                Location COLLATE utf8mb4_unicode_ci AS location,
                'education' AS source
            FROM education_db
            {"WHERE MATCH(Title, descriptions) AGAINST (%s IN NATURAL LANGUAGE MODE)" if query else ""}

            UNION ALL

            SELECT
                id,
                Actions COLLATE utf8mb4_unicode_ci AS title,
                ` SDGs` COLLATE utf8mb4_unicode_ci AS sdgs,
                `Location (specific actions/org onlyonly)` COLLATE utf8mb4_unicode_ci AS location,
                'actions' AS source
            FROM action_db
            {"WHERE MATCH(Actions, `Action detail`) AGAINST (%s IN NATURAL LANGUAGE MODE)" if query else ""}

            UNION ALL

            SELECT
                MIN(id) AS id,
                keyword COLLATE utf8mb4_unicode_ci AS title,
                GROUP_CONCAT(DISTINCT CASE WHEN sdg_number IS NOT NULL AND sdg_number != '' THEN sdg_number END ORDER BY CAST(sdg_number AS UNSIGNED) SEPARATOR ', ') COLLATE utf8mb4_unicode_ci AS sdgs,
                '' AS location,
                'keywords' AS source
            FROM keyword_resources
            {"WHERE MATCH(keyword) AGAINST (%s IN NATURAL LANGUAGE MODE)" if query else ""}
            GROUP BY keyword
        ) AS combined
        {where_clause}
    """

    main_params = [query] * 6 if query else [''] * 6
    count_params = [query] * 3 if query else [''] * 3

    main_params += filter_params + [size, offset]
    count_params += filter_params

    with connection.cursor() as cursor:
        cursor.execute(raw_query, main_params)
        columns = [col[0] for col in cursor.description]
        raw_results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # Process SDG data according to correct field mapping
        for r in raw_results:
            # For 'keywords' source, organization field stores target_code, and sdgs field stores sdg_number
            if r.get('source') == 'keywords':
                # Process organization field (target_code - SDG target codes like 3.9, 7.1, 7.2)
                if 'organization' in r and r['organization']:
                    if isinstance(r['organization'], str):
                        # Clean and sort SDG target codes
                        targets = [target.strip() for target in r['organization'].split(',') if target.strip()]
                        # Sort SDG targets numerically
                        def target_sort_key(target_str):
                            try:
                                # Handle formats like "7.A", "7.B"
                                if '.' in target_str:
                                    parts = target_str.split('.')
                                    major = int(parts[0])
                                    minor_part = parts[1]
                                    if minor_part.isdigit():
                                        minor = int(minor_part)
                                    else:
                                        # For letter suffixes, convert to numbers (A=100, B=101, etc.)
                                        minor = ord(minor_part.upper()) - ord('A') + 100
                                    return (major, minor)
                                else:
                                    return (int(target_str), 0)
                            except:
                                return (999, 999)  # Invalid formats go to the end
                        
                        r['organization'] = ', '.join(sorted(set(targets), key=target_sort_key))
                
                # Process sdgs field (sdg_number - main SDG numbers like 3, 7, 8) and create sdgs_list
                if 'sdgs' in r and isinstance(r['sdgs'], str):
                    sdg_str = r['sdgs'].strip()
                    if sdg_str == '18':
                        r['sdgs_list'] = list(range(1, 18))
                    elif sdg_str:
                        # Handle comma-separated SDG numbers
                        sdg_numbers = []
                        for s in re.split(r'[,\s]+', sdg_str):
                            s = s.strip()
                            if s.isdigit():
                                num = int(s)
                                if 1 <= num <= 17:  # Valid SDG range
                                    sdg_numbers.append(num)
                        r['sdgs_list'] = sorted(list(set(sdg_numbers)))
                    else:
                        r['sdgs_list'] = []
                else:
                    r['sdgs_list'] = []
                    
            else:
                # For education and actions sources, keep original logic
                if 'sdgs' in r and isinstance(r['sdgs'], str):
                    sdg_str = r['sdgs'].strip()
                    if sdg_str == '18':
                        r['sdgs_list'] = list(range(1, 18))
                    elif sdg_str:
                        # Handle comma-separated SDG numbers and remove duplicates
                        sdg_numbers = []
                        for s in re.findall(r'\d+', sdg_str):
                            if s.isdigit():
                                num = int(s)
                                if 1 <= num <= 17:  # Valid SDG range
                                    sdg_numbers.append(num)
                        r['sdgs_list'] = sorted(list(set(sdg_numbers)))
                    else:
                        r['sdgs_list'] = []
                else:
                    r['sdgs_list'] = []
                
                # Clean organization field, removing empty values and 'None'
                if 'organization' in r and r['organization']:
                    if isinstance(r['organization'], str):
                        orgs = [org.strip() for org in r['organization'].split(',') if org.strip() and org.strip().lower() != 'none']
                        r['organization'] = ', '.join(sorted(set(orgs))) if orgs else ''
                    else:
                        r['organization'] = ''
                else:
                    r['organization'] = ''

    results = raw_results

    with connection.cursor() as cursor:
        cursor.execute(count_query, count_params)
        total = cursor.fetchone()[0]

    return Response({
        'results': results,
        'total': total,
        'num_pages': math.ceil(total / size),
        'current_page': page,
        'debug_info': {
            'query_used': query,
            'filters_applied': len(filters),
            'total_results': len(results)
        }
    })


@api_view(['GET'])
def instant_search(request):
    """
    Instant search endpoint using Meilisearch
    Returns search results with highlighting for real-time search-as-you-type
    """
    # Check Meilisearch availability at runtime
    available, Client, MeilisearchError = check_meilisearch()
    if not available:
        return JsonResponse({
            'error': 'Meilisearch not available',
            'hits': [],
            'processingTimeMs': 0
        }, status=503)
    
    try:
        query = request.GET.get('q', '').strip()
        limit = int(request.GET.get('limit', 8))
        
        if len(query) < 2:
            return JsonResponse({
                'hits': [],
                'processingTimeMs': 0,
                'query': query
            })
        
        client = Client(settings.MEILI_HOST, settings.MEILI_KEY)
        index = client.index(settings.SEARCH_INDEX_NAME)
        
        search_result = index.search(query, {
            "limit": limit,
            "attributesToHighlight": ["title", "summary"],
            "highlightPreTag": "<mark>",
            "highlightPostTag": "</mark>",
        })
        
        return JsonResponse({
            'hits': search_result['hits'],
            'processingTimeMs': search_result.get('processingTimeMs', 0),
            'query': query,
            'nbHits': search_result.get('nbHits', 0)
        })
        
    except MeilisearchError as e:
        logger.error(f'Meilisearch error: {e}')
        return JsonResponse({
            'error': f'Search error: {str(e)}',
            'hits': [],
            'processingTimeMs': 0
        }, status=500)
    except Exception as e:
        logger.error(f'Unexpected search error: {e}')
        return JsonResponse({
            'error': 'Internal server error',
            'hits': [],
            'processingTimeMs': 0
        }, status=500)


@lru_cache(maxsize=1)
def _get_symspell():
    """Create and cache SymSpell instance"""
    available, SymSpell, Verbosity = check_symspell()
    if not available:
        return None
    
    try:
        sym_spell = SymSpell(max_dictionary_edit_distance=2, prefix_length=7)
        
        # Try to load frequency dictionary
        dict_path = os.path.join(os.path.dirname(__file__), '../../dicts/frequency_dictionary_en_82_765.txt')
        if os.path.exists(dict_path):
            sym_spell.load_dictionary(dict_path, term_index=0, count_index=1)
            logger.info(f"SymSpell dictionary loaded from {dict_path}")
        else:
            logger.warning(f"SymSpell dictionary not found at {dict_path}")
            return None
            
        return sym_spell
    except Exception as e:
        logger.error(f"Failed to initialize SymSpell: {e}")
        return None


@api_view(['GET'])
def spell_check(request):
    """
    Spell checking endpoint using SymSpell
    Returns spelling suggestions for misspelled queries
    """
    available, SymSpell, Verbosity = check_symspell()
    if not available:
        return JsonResponse({
            'suggestion': None,
            'error': 'SymSpell not available'
        }, status=503)
    
    try:
        query = request.GET.get('q', '').strip()
        
        if len(query) < 2:
            return JsonResponse({'suggestion': None})
        
        sym_spell = _get_symspell()
        if not sym_spell:
            return JsonResponse({
                'suggestion': None,
                'error': 'SymSpell not initialized'
            }, status=503)
        
        suggestions = sym_spell.lookup_compound(query, max_edit_distance=2)
        
        if suggestions and len(suggestions) > 0:
            best_suggestion = suggestions[0].term
            if best_suggestion.lower() != query.lower():
                return JsonResponse({
                    'suggestion': best_suggestion,
                    'original': query
                })
        
        return JsonResponse({'suggestion': None})
        
    except Exception as e:
        logger.error(f'Spell check error: {e}')
        return JsonResponse({
            'suggestion': None,
            'error': 'Spell check failed'
        }, status=500)
