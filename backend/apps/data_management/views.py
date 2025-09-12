from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from django.contrib.auth.decorators import user_passes_test
from django.db.models import Q
from django.core.paginator import Paginator
from django.db import connection
import pandas as pd
import re
import traceback

# Import your existing models
from ..education.models import EducationDb
from ..actions.models import ActionDb

# Permission check for admin users
def is_admin_user(user):
    return user.is_authenticated and user.is_staff

# =============================================================================
# EDUCATION DATABASE MANAGEMENT ENDPOINTS
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@user_passes_test(is_admin_user)
def education_management_list(request):
    """Get paginated list of education records for management"""
    try:
        # Get query parameters
        search = request.GET.get('search', '')
        year_filter = request.GET.get('year', '')
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        
        # Build queryset
        queryset = EducationDb.objects.all()
        
        # Apply filters
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(organization__icontains=search)
            )
        
        if year_filter:
            queryset = queryset.filter(year=year_filter)
        
        # Order by ID for consistent pagination
        queryset = queryset.order_by('-id')
        
        # Paginate
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        # Serialize data
        education_data = []
        for item in page_obj:
            education_data.append({
                'id': item.id,
                'title': item.title or '',
                'description': item.descriptions or '',
                'year': item.year or '',
                'organization': item.organization or '',
                'location': item.location or '',
            })
        
        return Response({
            'results': education_data,
            'count': paginator.count,
            'num_pages': paginator.num_pages,
            'current_page': page,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to load education data: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@user_passes_test(is_admin_user)
def education_management_delete(request):
    """Delete education records (single or multiple)"""
    try:
        record_ids = request.data.get('ids', [])
        
        if not record_ids:
            return Response(
                {'error': 'No record IDs provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Since EducationDb is not managed, use raw SQL
        with connection.cursor() as cursor:
            ids_str = ','.join(map(str, record_ids))
            cursor.execute(f"DELETE FROM education_db WHERE id IN ({ids_str})")
            deleted_count = cursor.rowcount
        
        return Response({
            'message': f'Successfully deleted {deleted_count} record(s)',
            'deleted_count': deleted_count
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to delete records: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@user_passes_test(is_admin_user)
@parser_classes([MultiPartParser])
def education_excel_upload(request):
    """Process Excel file for education database import"""
    try:
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file uploaded'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        uploaded_file = request.FILES['file']
        
        # Validate file type
        if not uploaded_file.name.endswith(('.xlsx', '.xls')):
            return Response(
                {'error': 'Invalid file type. Please upload an Excel file.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Read Excel file
        df = pd.read_excel(uploaded_file)
        
        # Get column mapping
        column_mapping = map_education_columns(df.columns.tolist())
        
        # Validate and process data
        validation_results = validate_education_data(df, column_mapping)
        
        # Check for duplicates
        duplicate_results = check_education_duplicates(validation_results['valid_records'])
        
        return Response({
            'column_mapping': column_mapping,
            'validation_results': validation_results,
            'duplicate_results': duplicate_results,
            'total_rows': len(df),
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to process file: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@user_passes_test(is_admin_user)
def education_import_confirm(request):
    """Confirm and execute education data import with detailed error tracking"""
    try:
        import_data = request.data.get('data', [])
        skip_duplicates = request.data.get('skip_duplicates', True)
        
        if not import_data:
            return Response(
                {'error': 'No data to import'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Import data using raw SQL since model is not managed
        imported_count = 0
        skipped_count = 0
        failed_count = 0
        failed_records = []
        
        with connection.cursor() as cursor:
            for i, record in enumerate(import_data):
                try:
                    # Check for duplicates if skip_duplicates is True
                    if skip_duplicates and record.get('title'):
                        cursor.execute(
                            "SELECT id FROM education_db WHERE LOWER(Title) = LOWER(%s)",
                            [record['title']]
                        )
                        if cursor.fetchone():
                            skipped_count += 1
                            continue
                    
                    # Validate required fields before insert
                    if not record.get('title'):
                        failed_count += 1
                        failed_records.append({
                            'record': record,
                            'error': 'Missing required field: title',
                            'details': 'Title field is required for education records',
                            'row_index': record.get('_row_index', i + 1)
                        })
                        continue
                    
                    # Prepare data for insertion
                    insert_data = [
                        record.get('title', ''),
                        record.get('descriptions', ''),
                        record.get('aims', ''),
                        record.get('learning_outcome_expecting_outcome_field', ''),
                        record.get('sdgs_related', ''),
                        record.get('type_label', ''),
                        record.get('location', ''),
                        record.get('organization', ''),
                        record.get('year', ''),
                        record.get('related_to_which_discipline', ''),
                        record.get('useful_for_which_industries', ''),
                        record.get('source', ''),
                        record.get('link', ''),
                    ]
                    
                    # Insert record
                    insert_sql = """
                        INSERT INTO education_db (
                            Title, descriptions, Aims, `Learning outcome( Expecting outcome)`, 
                            `SDGs related`, `Type label`, Location, Organization, Year, 
                            `Related to which discipline`, `Useful for which industries`, 
                            Source, Link
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """

                    cursor.execute(insert_sql, insert_data)
                    imported_count += 1
                    
                except Exception as e:
                    failed_count += 1
                    error_msg = str(e)
                    
                    # Categorize common errors
                    if 'Data too long' in error_msg:
                        error_type = 'Data too long for field'
                        details = 'One or more fields exceed maximum length'
                    elif 'Duplicate entry' in error_msg:
                        error_type = 'Duplicate entry'
                        details = 'Record already exists in database'
                    elif 'cannot be null' in error_msg.lower():
                        error_type = 'Missing required field'
                        details = 'Required field is missing or empty'
                    else:
                        error_type = 'Database error'
                        details = error_msg
                    
                    failed_records.append({
                        'record': record,
                        'error': error_type,
                        'details': details,
                        'row_index': record.get('_row_index', i + 1)
                    })
                    continue
        
        return Response({
            'message': f'Import completed successfully',
            'imported_count': imported_count,
            'skipped_count': skipped_count,
            'failed_count': failed_count,
            'failed_records': failed_records[:50]  # Limit to first 50 failed records
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to import data: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# =============================================================================
# ACTIONS DATABASE MANAGEMENT ENDPOINTS
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@user_passes_test(is_admin_user)
def actions_management_list(request):
    """Get paginated list of action records for management"""
    try:
        # Get query parameters
        search = request.GET.get('search', '')
        level_filter = request.GET.get('level', '')
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        
        # Build queryset
        queryset = ActionDb.objects.all()
        
        # Apply filters
        if search:
            queryset = queryset.filter(
                Q(actions__icontains=search) |
                Q(action_detail__icontains=search)
            )
        
        if level_filter:
            queryset = queryset.filter(level=level_filter)
        
        # Order by ID for consistent pagination
        queryset = queryset.order_by('-id')
        
        # Paginate
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        # Serialize data
        actions_data = []
        for item in page_obj:
            actions_data.append({
                'id': item.id,
                'actions': item.actions or '',
                'action_detail': item.action_detail or '',
                'level': item.level,
                'level_label': item.level_label,
                'location': item.location,
            })
        
        return Response({
            'results': actions_data,
            'count': paginator.count,
            'num_pages': paginator.num_pages,
            'current_page': page,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to load actions data: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@user_passes_test(is_admin_user)
def actions_management_delete(request):
    """Delete action records (single or multiple)"""
    try:
        record_ids = request.data.get('ids', [])
        
        if not record_ids:
            return Response(
                {'error': 'No record IDs provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Since ActionDb is not managed, use raw SQL
        with connection.cursor() as cursor:
            ids_str = ','.join(map(str, record_ids))
            cursor.execute(f"DELETE FROM action_db WHERE id IN ({ids_str})")
            deleted_count = cursor.rowcount
        
        return Response({
            'message': f'Successfully deleted {deleted_count} record(s)',
            'deleted_count': deleted_count
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to delete records: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@user_passes_test(is_admin_user)
@parser_classes([MultiPartParser])
def actions_excel_upload(request):
    """Process Excel file for actions database import"""
    try:
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file uploaded'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        uploaded_file = request.FILES['file']
        
        # Validate file type
        if not uploaded_file.name.endswith(('.xlsx', '.xls')):
            return Response(
                {'error': 'Invalid file type. Please upload an Excel file.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Read Excel file
        df = pd.read_excel(uploaded_file)
        
        # Get column mapping
        column_mapping = map_actions_columns(df.columns.tolist())
        
        # Validate and process data
        validation_results = validate_actions_data(df, column_mapping)
        
        # Check for duplicates
        duplicate_results = check_actions_duplicates(validation_results['valid_records'])
        
        return Response({
            'column_mapping': column_mapping,
            'validation_results': validation_results,
            'duplicate_results': duplicate_results,
            'total_rows': len(df),
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to process file: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@user_passes_test(is_admin_user)
def actions_import_confirm(request):
    """Confirm and execute actions data import with detailed error tracking"""
    try:
        import_data = request.data.get('data', [])
        skip_duplicates = request.data.get('skip_duplicates', True)
        
        if not import_data:
            return Response(
                {'error': 'No data to import'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Import data using raw SQL since model is not managed
        imported_count = 0
        skipped_count = 0
        failed_count = 0
        failed_records = []
        
        with connection.cursor() as cursor:
            for i, record in enumerate(import_data):
                try:
                    # Check for duplicates if skip_duplicates is True
                    if skip_duplicates and record.get('actions'):
                        cursor.execute(
                            "SELECT id FROM action_db WHERE LOWER(Actions) = LOWER(%s)",
                            [record['actions']]
                        )
                        if cursor.fetchone():
                            skipped_count += 1
                            continue
                    
                    # Validate required fields before insert
                    if not record.get('actions'):
                        failed_count += 1
                        failed_records.append({
                            'record': record,
                            'error': 'Missing required field: actions',
                            'details': 'Actions field is required for action records',
                            'row_index': record.get('_row_index', i + 1)
                        })
                        continue
                    
                    # Prepare data for insertion
                    insert_data = [
                        record.get('actions', ''),
                        record.get('action_detail', ''),
                        record.get('field_sdgs', ''),
                        record.get('level', None),
                        record.get('individual_organization', None),
                        record.get('location_specific_actions_org_onlyonly_field', ''),
                        record.get('related_industry_org_only_field', ''),
                        record.get('digital_actions', None),
                        record.get('source_descriptions', ''),
                        record.get('award_descriptions', ''),
                        record.get('award', None),
                        record.get('source_links', ''),
                        record.get('additional_notes', ''),
                    ]
                    
                    # Insert record
                    insert_sql = """
                        INSERT INTO action_db (
                            Actions, `Action detail`, ` SDGs`, Level, `Individual/Organization`,
                            `Location (specific actions/org onlyonly)`, `Related Industry (org only)`,
                            `Digital actions`, `Source descriptions`, `Award descriptions`, Award,
                            `Source Links`, `Additional Notes`
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    
                    cursor.execute(insert_sql, insert_data)
                    imported_count += 1
                    
                except Exception as e:
                    failed_count += 1
                    error_msg = str(e)
                    
                    # Categorize common errors
                    if 'Data too long' in error_msg:
                        error_type = 'Data too long for field'
                        details = 'One or more fields exceed maximum length'
                    elif 'Duplicate entry' in error_msg:
                        error_type = 'Duplicate entry'
                        details = 'Record already exists in database'
                    elif 'cannot be null' in error_msg.lower():
                        error_type = 'Missing required field'
                        details = 'Required field is missing or empty'
                    elif 'Incorrect integer value' in error_msg:
                        error_type = 'Invalid data type'
                        details = 'Level field must be a valid integer'
                    else:
                        error_type = 'Database error'
                        details = error_msg
                    
                    failed_records.append({
                        'record': record,
                        'error': error_type,
                        'details': details,
                        'row_index': record.get('_row_index', i + 1)
                    })
                    continue
        
        return Response({
            'message': f'Import completed successfully',
            'imported_count': imported_count,
            'skipped_count': skipped_count,
            'failed_count': failed_count,
            'failed_records': failed_records[:50]  # Limit to first 50 failed records
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to import data: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# =============================================================================
# UTILITY FUNCTIONS (unchanged from original)
# =============================================================================

def map_education_columns(excel_columns):
    """Map Excel columns to Education database fields"""
    mapping = {}
    
    # Define field mappings
    field_mappings = {
        'Title': 'title',
        'Description': 'descriptions',
        'Aims': 'aims',
        'Learning outcome( Expecting outcome)': 'learning_outcome_expecting_outcome_field',
        'SDGs related': 'sdgs_related',
        'Type label': 'type_label',
        'Location': 'location',
        'Organization': 'organization',
        'Year': 'year',
        'Related to which discipline': 'related_to_which_discipline',
        'Useful for which industries': 'useful_for_which_industries',
        'Source': 'source',
        'Link': 'link',
    }
    
    required_fields = ['title', 'descriptions']
    
    for i, excel_col in enumerate(excel_columns):
        clean_col = excel_col.strip() if excel_col else ''
        if clean_col in ['Item ID', 'item id', 'ID', 'id']:
            mapped_field = None
            status = 'unmapped'
        else:
            mapped_field = field_mappings.get(clean_col)
            if mapped_field:
                status = 'required' if mapped_field in required_fields else 'optional'
            else:
                status = 'unmapped'
        
        mapping[i] = {
            'excel_column': excel_col,
            'mapped_field': mapped_field,
            'status': status
        }
    
    return mapping

def map_actions_columns(excel_columns):
    """Map Excel columns to Actions database fields"""
    mapping = {}
    
    # Define field mappings
    field_mappings = {
        'Actions': 'actions',
        'Action detail': 'action_detail',
        'SDGs': 'field_sdgs',
        'Level': 'level',
        'Individual/Organization': 'individual_organization',
        'Location (specific actions/org onlyonly)': 'location_specific_actions_org_onlyonly_field',
        'Related Industry (org only)': 'related_industry_org_only_field',
        'Digital actions': 'digital_actions',
        'Source descriptions': 'source_descriptions',
        'Award descriptions': 'award_descriptions',
        'Award': 'award',
        'Source Links': 'source_links',
        'Additional Notes': 'additional_notes',
    }
    
    required_fields = ['actions', 'action_detail']
    
    for i, excel_col in enumerate(excel_columns):
        clean_col = excel_col.strip() if excel_col else ''
        if clean_col in ['Item ID', 'item id', 'ID', 'id']:
            mapped_field = None
            status = 'unmapped'
        else:
            mapped_field = field_mappings.get(clean_col)
            if mapped_field:
                status = 'required' if mapped_field in required_fields else 'optional'
            else:
                status = 'unmapped'
        
        mapping[i] = {
            'excel_column': excel_col,
            'mapped_field': mapped_field,
            'status': status
        }
    
    return mapping

def validate_education_data(df, column_mapping):
    """Validate education data from Excel"""
    valid_records = []
    invalid_records = []
    
    required_fields = ['title', 'descriptions']
    
    for index, row in df.iterrows():
        record = {}
        errors = []
        
        # Map columns to fields
        for col_index, mapping in column_mapping.items():
            if mapping['mapped_field'] and col_index < len(row):
                value = row.iloc[col_index]
                if pd.notna(value):
                    record[mapping['mapped_field']] = str(value).strip()
        
        # Check required fields
        for field in required_fields:
            if field not in record or not record[field]:
                errors.append(f'Missing required field: {field}')
        
        if errors:
            invalid_records.append({
                'row_index': index + 2,  # +2 for header and 0-based index
                'data': record,
                'errors': errors
            })
        else:
            record['_row_index'] = index + 2
            valid_records.append(record)
    
    return {
        'valid_records': valid_records,
        'invalid_records': invalid_records,
        'valid_count': len(valid_records),
        'invalid_count': len(invalid_records)
    }

def validate_actions_data(df, column_mapping):
    """Validate actions data from Excel"""
    valid_records = []
    invalid_records = []
    
    required_fields = ['actions', 'action_detail']
    
    for index, row in df.iterrows():
        record = {}
        errors = []
        
        # Map columns to fields
        for col_index, mapping in column_mapping.items():
            if mapping['mapped_field'] and col_index < len(row):
                value = row.iloc[col_index]
                if pd.notna(value):
                    record[mapping['mapped_field']] = str(value).strip()
        
        # Check required fields
        for field in required_fields:
            if field not in record or not record[field]:
                errors.append(f'Missing required field: {field}')
        
        if errors:
            invalid_records.append({
                'row_index': index + 2,
                'data': record,
                'errors': errors
            })
        else:
            record['_row_index'] = index + 2
            valid_records.append(record)
    
    return {
        'valid_records': valid_records,
        'invalid_records': invalid_records,
        'valid_count': len(valid_records),
        'invalid_count': len(invalid_records)
    }

def check_education_duplicates(valid_records):
    """Check for duplicate education records - FIXED to match import logic exactly"""
    duplicates = []
    seen_titles = set()
    
    with connection.cursor() as cursor:
        for i, record in enumerate(valid_records):
            title = record.get('title', '').strip()
            if title:
                title_lower = title.lower()
                
                # Check for duplicates within the file first
                if title_lower in seen_titles:
                    duplicates.append({
                        'index': i,
                        'record': record,
                        'duplicate_title': title,
                        'type': 'in_file'
                    })
                    continue
                
                # Check against database using EXACT same query as import phase
                cursor.execute(
                    "SELECT id FROM education_db WHERE LOWER(Title) = LOWER(%s)",
                    [title]
                )
                if cursor.fetchone():
                    duplicates.append({
                        'index': i,
                        'record': record,
                        'duplicate_title': title,
                        'type': 'existing'
                    })
                else:
                    # Only add to seen_titles if it's truly unique
                    seen_titles.add(title_lower)
    
    return {
        'duplicates': duplicates,
        'duplicate_count': len(duplicates)
    }

def check_actions_duplicates(valid_records):
    """Check for duplicate action records - FIXED to match import logic exactly"""
    duplicates = []
    seen_actions = set()
    
    with connection.cursor() as cursor:
        for i, record in enumerate(valid_records):
            action = record.get('actions', '').strip()
            if action:
                action_lower = action.lower()
                
                # Check for duplicates within the file first
                if action_lower in seen_actions:
                    duplicates.append({
                        'index': i,
                        'record': record,
                        'duplicate_title': action,
                        'type': 'in_file'
                    })
                    continue
                
                # Check against database using EXACT same query as import phase
                cursor.execute(
                    "SELECT id FROM action_db WHERE LOWER(Actions) = LOWER(%s)",
                    [action]
                )
                if cursor.fetchone():
                    duplicates.append({
                        'index': i,
                        'record': record,
                        'duplicate_title': action,
                        'type': 'existing'
                    })
                else:
                    # Only add to seen_actions if it's truly unique
                    seen_actions.add(action_lower)
    
    return {
        'duplicates': duplicates,
        'duplicate_count': len(duplicates)
    }