from rest_framework.decorators import api_view  
from rest_framework.response import Response
from django.db import connection
import math
import re
from collections import defaultdict

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

    # Prepare search parameters
    if query:
        search_terms = [term.strip() for term in query.split() if term.strip()]
        boolean_query = ' '.join([f'+{term}*' for term in search_terms])
        like_query = f"%{query}%"
        exact_query = query.lower()
        prefix_query = f"{query.lower()}%"
    else:
        boolean_query = like_query = exact_query = prefix_query = ''

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
                (MATCH(Title, descriptions) AGAINST (%s IN BOOLEAN MODE) * 10 +
                 CASE WHEN LOWER(Title) = %s THEN 100 ELSE 0 END +
                 CASE WHEN LOWER(Title) LIKE %s THEN 50 ELSE 0 END +
                 CASE WHEN LOWER(descriptions) LIKE %s THEN 20 ELSE 0 END) AS relevance
            FROM education_db
            WHERE MATCH(Title, descriptions) AGAINST (%s IN BOOLEAN MODE) > 0
               OR LOWER(Title) LIKE %s
               OR LOWER(descriptions) LIKE %s

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
                (MATCH(Actions, `Action detail`) AGAINST (%s IN BOOLEAN MODE) * 10 +
                 CASE WHEN LOWER(Actions) = %s THEN 100 ELSE 0 END +
                 CASE WHEN LOWER(Actions) LIKE %s THEN 50 ELSE 0 END +
                 CASE WHEN LOWER(`Action detail`) LIKE %s THEN 20 ELSE 0 END) AS relevance
            FROM action_db
            WHERE MATCH(Actions, `Action detail`) AGAINST (%s IN BOOLEAN MODE) > 0
               OR LOWER(Actions) LIKE %s
               OR LOWER(`Action detail`) LIKE %s

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
                    CASE WHEN LOWER(keyword) LIKE %s THEN 50 ELSE 0 END) AS relevance
            FROM keyword_resources
            WHERE MATCH(keyword) AGAINST (%s IN BOOLEAN MODE) > 0
               OR LOWER(keyword) LIKE %s
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
            WHERE MATCH(Title, descriptions) AGAINST (%s IN BOOLEAN MODE) > 0
               OR LOWER(Title) LIKE %s
               OR LOWER(descriptions) LIKE %s

            UNION ALL

            SELECT
                id,
                Actions COLLATE utf8mb4_unicode_ci AS title,
                ` SDGs` COLLATE utf8mb4_unicode_ci AS sdgs,
                `Location (specific actions/org onlyonly)` COLLATE utf8mb4_unicode_ci AS location,
                'actions' AS source
            FROM action_db
            WHERE MATCH(Actions, `Action detail`) AGAINST (%s IN BOOLEAN MODE) > 0
               OR LOWER(Actions) LIKE %s
               OR LOWER(`Action detail`) LIKE %s

            UNION ALL

            SELECT
                MIN(id) AS id,
                keyword COLLATE utf8mb4_unicode_ci AS title,
                GROUP_CONCAT(DISTINCT CASE WHEN sdg_number IS NOT NULL AND sdg_number != '' THEN sdg_number END ORDER BY CAST(sdg_number AS UNSIGNED) SEPARATOR ', ') COLLATE utf8mb4_unicode_ci AS sdgs,
                '' AS location,
                'keywords' AS source
            FROM keyword_resources
            WHERE MATCH(keyword) AGAINST (%s IN BOOLEAN MODE) > 0
               OR LOWER(keyword) LIKE %s
            GROUP BY keyword
        ) AS combined
        {where_clause}
    """

    # Build parameters arrays
    if query:
        # Education: 7 params (4 relevance + 3 search)
        education_params = [boolean_query, exact_query, prefix_query, like_query, boolean_query, like_query, like_query]
        # Actions: 7 params (4 relevance + 3 search)  
        actions_params = [boolean_query, exact_query, prefix_query, like_query, boolean_query, like_query, like_query]
        # Keywords: 5 params (3 relevance + 2 search)
        keywords_params = [boolean_query, exact_query, prefix_query, boolean_query, like_query]
        
        # Count query params
        count_education_params = [boolean_query, like_query, like_query]
        count_actions_params = [boolean_query, like_query, like_query]
        count_keywords_params = [boolean_query, like_query]
    else:
        education_params = [''] * 7
        actions_params = [''] * 7
        keywords_params = [''] * 5
        count_education_params = [''] * 3
        count_actions_params = [''] * 3
        count_keywords_params = [''] * 2

    main_params = education_params + actions_params + keywords_params + filter_params + [size, offset]
    count_params = count_education_params + count_actions_params + count_keywords_params + filter_params

    with connection.cursor() as cursor:
        cursor.execute(raw_query, main_params)
        columns = [col[0] for col in cursor.description]
        raw_results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # Process SDG data
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
            'total_results': len(results),
            'boolean_query': boolean_query if query else 'none'
        }
    })