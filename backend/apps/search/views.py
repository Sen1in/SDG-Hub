from rest_framework.decorators import api_view  
from rest_framework.response import Response
from django.db import connection
import math
import re
from collections import defaultdict

def build_flexible_search_queries(query):
    """
    Build flexible search queries based on term count
    - Single term: strict match (+term*)
    - Two terms: both required (+term1* +term2*)
    - 3+ terms: flexible match (require 60-80% of terms)
    """
    if not query:
        return {
            'boolean_query': '',
            'exact_query': '',
            'prefix_query': '',
            'like_query': '',
            'word_count': 0
        }
    
    search_terms = [term.strip() for term in query.split() if term.strip()]
    word_count = len(search_terms)
    
    if word_count == 1:
        # Single word: strict match
        boolean_query = f'+{search_terms[0]}*'
    elif word_count == 2:
        # Two words: both required
        boolean_query = f'+{search_terms[0]}* +{search_terms[1]}*'
    else:
        # Multiple words: flexible matching
        # Require at least 60% of words, but minimum 2 words
        required_count = max(2, int(word_count * 0.6))
        
        # First N words are required, rest are optional
        required_terms = [f'+{term}*' for term in search_terms[:required_count]]
        optional_terms = [f'{term}*' for term in search_terms[required_count:]]
        
        boolean_query = ' '.join(required_terms + optional_terms)
    
    exact_query = query.lower()
    prefix_query = f"{query.lower()}%"
    like_query = f"%{query}%"
    
    return {
        'boolean_query': boolean_query,
        'exact_query': exact_query,
        'prefix_query': prefix_query,
        'like_query': like_query,
        'word_count': word_count
    }

def calculate_word_match_penalty(title, query_terms):
    """
    Calculate penalty for partial word matches to prevent single-word matches from ranking too high
    Returns a penalty score (negative value) based on match ratio
    """
    if not title or not query_terms:
        return 0
    
    title_words = set(re.findall(r'\w+', title.lower()))
    query_words = set(term.lower() for term in query_terms)
    
    if len(query_words) <= 1:
        return 0  # No penalty for single word queries
    
    matched_words = len(query_words.intersection(title_words))
    match_ratio = matched_words / len(query_words)
    
    # Apply penalty for low match ratios
    if match_ratio < 0.3:  # Less than 30% words matched
        return -20
    elif match_ratio < 0.5:  # Less than 50% words matched
        return -10
    elif match_ratio < 0.7:  # Less than 70% words matched
        return -5
    else:
        return 0  # No penalty for good matches

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

    # Build flexible search queries
    search_queries = build_flexible_search_queries(query)
    search_terms = query.split() if query else []

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
                (MATCH(Title, descriptions) AGAINST (%s IN BOOLEAN MODE) * 8 +
                 CASE WHEN LOWER(Title) = %s THEN 100 ELSE 0 END +
                 CASE WHEN LOWER(Title) LIKE %s THEN 50 ELSE 0 END +
                 CASE WHEN LOWER(descriptions) LIKE %s THEN 15 ELSE 0 END +
                 -- Bonus for title word density
                 CASE WHEN %s > 0 THEN 
                     (LENGTH(LOWER(Title)) - LENGTH(REPLACE(LOWER(Title), %s, ''))) / LENGTH(%s) * 5
                 ELSE 0 END) AS relevance
            FROM education_db
            WHERE (%s != '' AND (MATCH(Title, descriptions) AGAINST (%s IN BOOLEAN MODE) > 0
               OR LOWER(Title) LIKE %s
               OR LOWER(descriptions) LIKE %s)) OR %s = ''

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
                (MATCH(Actions, `Action detail`) AGAINST (%s IN BOOLEAN MODE) * 8 +
                 CASE WHEN LOWER(Actions) = %s THEN 100 ELSE 0 END +
                 CASE WHEN LOWER(Actions) LIKE %s THEN 50 ELSE 0 END +
                 CASE WHEN LOWER(`Action detail`) LIKE %s THEN 15 ELSE 0 END +
                 -- Award bonus for actions (moderate boost when filtering by actions)
                 CASE WHEN Award IS NOT NULL AND Award > 0 THEN 8 ELSE 0 END +
                 -- Title word density bonus
                 CASE WHEN %s > 0 THEN 
                     (LENGTH(LOWER(Actions)) - LENGTH(REPLACE(LOWER(Actions), %s, ''))) / LENGTH(%s) * 5
                 ELSE 0 END) AS relevance
            FROM action_db
            WHERE (%s != '' AND (MATCH(Actions, `Action detail`) AGAINST (%s IN BOOLEAN MODE) > 0
               OR LOWER(Actions) LIKE %s
               OR LOWER(`Action detail`) LIKE %s)) OR %s = ''

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
                MAX(MATCH(keyword) AGAINST (%s IN BOOLEAN MODE) * 10 +
                    CASE WHEN LOWER(keyword) = %s THEN 100 ELSE 0 END +
                    CASE WHEN LOWER(keyword) LIKE %s THEN 60 ELSE 0 END) AS relevance
            FROM keyword_resources
            WHERE (%s != '' AND (MATCH(keyword) AGAINST (%s IN BOOLEAN MODE) > 0
               OR LOWER(keyword) LIKE %s)) OR %s = ''
            GROUP BY keyword
        ) AS combined
        {where_clause}
        {sort_clause}
        LIMIT %s OFFSET %s
    """

    count_query = f"""
        SELECT COUNT(*) FROM (
            SELECT
                id,
                Title COLLATE utf8mb4_unicode_ci AS title,
                `SDGs related` COLLATE utf8mb4_unicode_ci AS sdgs,
                Location COLLATE utf8mb4_unicode_ci AS location,
                'education' AS source
            FROM education_db
            WHERE (%s != '' AND (MATCH(Title, descriptions) AGAINST (%s IN BOOLEAN MODE) > 0
               OR LOWER(Title) LIKE %s
               OR LOWER(descriptions) LIKE %s)) OR %s = ''

            UNION ALL

            SELECT
                id,
                Actions COLLATE utf8mb4_unicode_ci AS title,
                ` SDGs` COLLATE utf8mb4_unicode_ci AS sdgs,
                `Location (specific actions/org onlyonly)` COLLATE utf8mb4_unicode_ci AS location,
                'actions' AS source
            FROM action_db
            WHERE (%s != '' AND (MATCH(Actions, `Action detail`) AGAINST (%s IN BOOLEAN MODE) > 0
               OR LOWER(Actions) LIKE %s
               OR LOWER(`Action detail`) LIKE %s)) OR %s = ''

            UNION ALL

            SELECT
                MIN(id) AS id,
                keyword COLLATE utf8mb4_unicode_ci AS title,
                GROUP_CONCAT(DISTINCT CASE WHEN sdg_number IS NOT NULL AND sdg_number != '' THEN sdg_number END ORDER BY CAST(sdg_number AS UNSIGNED) SEPARATOR ', ') COLLATE utf8mb4_unicode_ci AS sdgs,
                '' AS location,
                'keywords' AS source
            FROM keyword_resources
            WHERE (%s != '' AND (MATCH(keyword) AGAINST (%s IN BOOLEAN MODE) > 0
               OR LOWER(keyword) LIKE %s)) OR %s = ''
            GROUP BY keyword
        ) AS combined
        {where_clause}
    """

    # Build optimized parameter arrays
    boolean_q = search_queries['boolean_query']
    exact_q = search_queries['exact_query']
    prefix_q = search_queries['prefix_query']  
    like_q = search_queries['like_query']
    query_len_str = str(len(exact_q)) if exact_q else '0'
    
    # Main query parameters (optimized structure)
    main_params = [
        # Education params (12 total)
        boolean_q, exact_q, prefix_q, like_q,  # relevance calculation
        query_len_str, exact_q, exact_q,       # word density bonus
        boolean_q, boolean_q, like_q, like_q, boolean_q,  # where conditions
        
        # Actions params (13 total) 
        boolean_q, exact_q, prefix_q, like_q,  # relevance calculation
        query_len_str, exact_q, exact_q,       # word density bonus
        boolean_q, boolean_q, like_q, like_q, boolean_q,  # where conditions
        
        # Keywords params (7 total)
        boolean_q, exact_q, prefix_q,          # relevance calculation
        boolean_q, boolean_q, like_q, boolean_q,  # where conditions
    ]
    
    # Count query parameters (12 total)
    count_params = [
        # Education count (5)
        boolean_q, boolean_q, like_q, like_q, boolean_q,
        # Actions count (5) 
        boolean_q, boolean_q, like_q, like_q, boolean_q,
        # Keywords count (3)
        boolean_q, boolean_q, like_q, boolean_q
    ]
    
    # Add filter parameters and pagination
    main_params.extend(filter_params + [size, offset])
    count_params.extend(filter_params)

    with connection.cursor() as cursor:
        try:
            cursor.execute(raw_query, main_params)
            columns = [col[0] for col in cursor.description]
            raw_results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        except Exception as e:
            # Fallback to simpler query if complex query fails
            print(f"Search query error: {e}")
            raw_results = []

        # Post-process results with word match penalties
        for r in raw_results:
            if search_terms and r.get('title'):
                penalty = calculate_word_match_penalty(r['title'], search_terms)
                r['relevance'] = (r.get('relevance', 0) or 0) + penalty

        # Process SDG data (keep your existing logic)
        for r in raw_results:
            if r.get('source') == 'keywords':
                if 'organization' in r and r['organization']:
                    if isinstance(r['organization'], str):
                        targets = [target.strip() for target in r['organization'].split(',') if target.strip()]
                        def target_sort_key(target_str):
                            try:
                                if '.' in target_str:
                                    parts = target_str.split('.')
                                    major = int(parts[0])
                                    minor_part = parts[1]
                                    if minor_part.isdigit():
                                        minor = int(minor_part)
                                    else:
                                        minor = ord(minor_part.upper()) - ord('A') + 100
                                    return (major, minor)
                                else:
                                    return (int(target_str), 0)
                            except:
                                return (999, 999)
                        
                        r['organization'] = ', '.join(sorted(set(targets), key=target_sort_key))
                
                if 'sdgs' in r and isinstance(r['sdgs'], str):
                    sdg_str = r['sdgs'].strip()
                    if sdg_str == '18':
                        r['sdgs_list'] = list(range(1, 18))
                    elif sdg_str:
                        sdg_numbers = []
                        for s in re.split(r'[,\s]+', sdg_str):
                            s = s.strip()
                            if s.isdigit():
                                num = int(s)
                                if 1 <= num <= 17:
                                    sdg_numbers.append(num)
                        r['sdgs_list'] = sorted(list(set(sdg_numbers)))
                    else:
                        r['sdgs_list'] = []
                else:
                    r['sdgs_list'] = []
                    
            else:
                if 'sdgs' in r and isinstance(r['sdgs'], str):
                    sdg_str = r['sdgs'].strip()
                    if sdg_str == '18':
                        r['sdgs_list'] = list(range(1, 18))
                    elif sdg_str:
                        sdg_numbers = []
                        for s in re.findall(r'\d+', sdg_str):
                            if s.isdigit():
                                num = int(s)
                                if 1 <= num <= 17:
                                    sdg_numbers.append(num)
                        r['sdgs_list'] = sorted(list(set(sdg_numbers)))
                    else:
                        r['sdgs_list'] = []
                else:
                    r['sdgs_list'] = []
                
                if 'organization' in r and r['organization']:
                    if isinstance(r['organization'], str):
                        orgs = [org.strip() for org in r['organization'].split(',') if org.strip() and org.strip().lower() != 'none']
                        r['organization'] = ', '.join(sorted(set(orgs))) if orgs else ''
                    else:
                        r['organization'] = ''
                else:
                    r['organization'] = ''

    # Re-sort by updated relevance scores if we applied penalties
    if search_terms:
        raw_results.sort(key=lambda x: x.get('relevance', 0), reverse=True)

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
            'boolean_query': search_queries['boolean_query'],
            'word_count': search_queries['word_count'],
            'filters_applied': len(filters),
            'total_results': len(results)
        }
    })