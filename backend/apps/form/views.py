from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.utils import timezone
from django.http import HttpResponse
from django.template.loader import render_to_string
from apps.team.models import Team, TeamMembership
from django.db import transaction
from weasyprint import HTML, CSS
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Form, FormContent, FormEditHistory, FormEditSession
from .serializers import (
    FormListSerializer,
    FormDetailSerializer, 
    CreateFormSerializer,
    FormContentSerializer,
    FormEditHistorySerializer,
    FormEditSessionSerializer
)
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import io
import json
import markdown

class TeamFormListCreateView(generics.ListCreateAPIView):
    """Team form list and creation API"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Obtain the list of forms for the specified team"""
        team_id = self.kwargs.get('team_id')
        team = get_object_or_404(Team, id=team_id)
        
        # Verify whether the user is a team member
        membership = TeamMembership.objects.filter(
            user=self.request.user,
            team=team
        ).first()
        
        if not membership:
            return Form.objects.none()
        
        return Form.objects.filter(team=team).select_related(
            'created_by', 'last_modified_by', 'team'
        )
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateFormSerializer
        return FormListSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['team_id'] = self.kwargs.get('team_id')
        return context
    
    def create(self, request, *args, **kwargs):
        """Create form - Requires edit or owner privileges"""
        team_id = kwargs.get('team_id')
        team = get_object_or_404(Team, id=team_id)
        
        # Check permissions
        membership = TeamMembership.objects.filter(
            user=request.user,
            team=team,
            role__in=['owner', 'edit']
        ).first()
        
        if not membership:
            return Response(
                {'error': 'Only team owner or edit member can create forms'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().create(request, *args, **kwargs)

class FormDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Form Details API"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FormDetailSerializer
    
    def get_queryset(self):
        """Obtain the forms that the user has permission to access"""
        return Form.objects.select_related(
            'created_by', 'last_modified_by', 'team'
        )
    
    def get_object(self):
        """Obtain the form object and check the permissions"""
        obj = super().get_object()
        
        # Check whether the user is a team member
        membership = TeamMembership.objects.filter(
            user=self.request.user,
            team=obj.team
        ).first()
        
        if not membership:
            from django.http import Http404
            raise Http404("Form not found")
        
        return obj
    
    def update(self, request, *args, **kwargs):
        """Update form - Requires write or admin privileges"""
        form = self.get_object()
        permission = form.get_user_permission(request.user)
        
        if permission not in ['write', 'admin']:
            return Response(
                {'error': 'Insufficient permissions to update this form'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update last modifier
        if hasattr(form, 'last_modified_by'):
            form.last_modified_by = request.user
            form.save(update_fields=['last_modified_by'])
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Delete form - Requires admin privileges"""
        form = self.get_object()
        permission = form.get_user_permission(request.user)
        
        if permission != 'admin':
            return Response(
                {'error': 'Only form admin can delete this form'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def team_form_stats(request, team_id):
    """Obtain the statistics of the team form"""
    team = get_object_or_404(Team, id=team_id)
    
    # Verify permissions
    membership = TeamMembership.objects.filter(
        user=request.user,
        team=team
    ).first()
    
    if not membership:
        return Response(
            {'error': 'You are not a member of this team'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Obtain statistical data
    forms = Form.objects.filter(team=team)
    
    stats = {
        'total_forms': forms.count(),
        'active_forms': forms.filter(status='active').count(),
        'locked_forms': forms.filter(status='locked').count(),
        'archived_forms': forms.filter(status='archived').count(),
        'forms_by_type': {
            'action': forms.filter(type='action').count(),
            'education': forms.filter(type='education').count(),
            'blank': forms.filter(type='blank').count(),
            'ida': forms.filter(type='ida').count(),
        }
    }
    
    return Response(stats)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def toggle_form_lock(request, form_id):
    """Switch the form lock status"""
    form = get_object_or_404(Form, id=form_id)
    
    permission = form.get_user_permission(request.user)
    if permission != 'admin':
        return Response(
            {'error': 'Only form admin can lock/unlock forms'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Switching status
    if form.status == 'locked':
        form.status = 'active'
        message = 'Form unlocked successfully'
    elif form.status == 'active':
        form.status = 'locked'
        message = 'Form locked successfully'
    else:
        return Response(
            {'error': 'Can only lock/unlock active or locked forms'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    form.last_modified_by = request.user
    form.save(update_fields=['status', 'last_modified_by'])
    
    serializer = FormDetailSerializer(form, context={'request': request})
    return Response({
        'message': message,
        'form': serializer.data
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def duplicate_form(request, form_id):
    """Copy the form"""
    original_form = get_object_or_404(Form, id=form_id)
    
    # Check permissions
    permission = original_form.get_user_permission(request.user)
    if not permission:
        return Response(
            {'error': 'You do not have permission to access this form'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Check if user has permission to create in the team
    membership = TeamMembership.objects.filter(
        user=request.user,
        team=original_form.team,
        role__in=['owner', 'edit']
    ).first()
    
    if not membership:
        return Response(
            {'error': 'Only team owner or edit member can duplicate forms'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Create a duplicate copy
    duplicated_form = Form.objects.create(
        title=f"{original_form.title} (Copy)",
        description=original_form.description,
        type=original_form.type,
        status='active',
        team=original_form.team,
        created_by=request.user,
        last_modified_by=request.user,
        allow_anonymous=original_form.allow_anonymous,
        allow_multiple_submissions=original_form.allow_multiple_submissions,
        require_login=original_form.require_login,
        is_public=False,
        is_template=False,
        deadline=original_form.deadline,
        max_responses=original_form.max_responses,
    )
    
    serializer = FormDetailSerializer(duplicated_form, context={'request': request})
    return Response({
        'message': 'Form duplicated successfully',
        'form': serializer.data
    }, status=status.HTTP_201_CREATED)

class CollaborativeFormDetailView(generics.RetrieveUpdateAPIView):
    """Collaborative form detail and update API"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FormContentSerializer
    
    def get_object(self):
        form_id = self.kwargs.get('form_id')
        form = get_object_or_404(Form, id=form_id)
        
        # Check permissions
        if not self.has_form_access(form):
            from django.http import Http404
            raise Http404("Form not found")
        
        content, created = FormContent.objects.get_or_create(
            form=form,
            defaults={
                'version': 1,
                'title': form.title,
            }
        )

        content.form_status = form.status
        return content
    
    def has_form_access(self, form):
        """Check if user has access to the form"""
        from apps.team.models import TeamMembership
        membership = TeamMembership.objects.filter(
            user=self.request.user,
            team=form.team
        ).first()
        return membership is not None
    
    def get_editable_fields(self, form_type):
        """Return editable fields based on form type"""
        common_fields = ['title', 'description', 'location', 'organization', 'year', 'sdgs_related', 'source', 'link']
        
        if form_type == 'education':
            return common_fields + [
                'aims', 'learning_outcomes', 'type_label', 
                'related_discipline', 'useful_industries'
            ]
        elif form_type == 'action':
            return common_fields + [
                'actions', 'action_detail', 'level', 'individual_organization',
                'location_specific', 'related_industry', 'digital_actions',
                'source_descriptions', 'award', 'source_links', 
                'additional_notes', 'award_descriptions'
            ]
        elif form_type == 'blank':
            return ['title', 'description', 'free_content']
        elif form_type == 'ida':
            return [
                'title', 'description', 'designer_names', 
                'current_role_affiliation', 'impact_project_name', 'main_challenge',
                'project_description', 'selected_sdgs', 'impact_types', 
                'project_importance', 'existing_example',
                'implementation_step1', 'implementation_step2', 'implementation_step3',
                'implementation_step4', 'implementation_step5', 'implementation_step6',
                'resources_partnerships', 'skills_capabilities', 'impact_avenues',
                'risks_inhibitors', 'mitigation_strategies'
            ]
        return common_fields
    
    def update(self, request, *args, **kwargs):
        """Update form content"""
        content = self.get_object()
        field_name = request.data.get('field_name')
        field_value = request.data.get('field_value')
        
        if not field_name:
            return Response(
                {'error': 'field_name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if the field is editable for this form type
        editable_fields = self.get_editable_fields(content.form.type)
        if field_name not in editable_fields:
            return Response(
                {'error': f'Field {field_name} is not editable for this form type'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user has permission to edit this field
        if not self.has_field_edit_permission(content.form, field_name):
            return Response(
                {'error': 'No permission to edit this field'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Log edit history
        old_value = getattr(content, field_name, '')
        
        with transaction.atomic():
            setattr(content, field_name, field_value)
            content.version += 1
            content.save()

            # If updating title, also sync it to Form model

            if field_name == 'title' and field_value:
                content.form.title = field_value
                content.form.save(update_fields=['title'])
            
            # Log edit history
            FormEditHistory.objects.create(
                form=content.form,
                user=request.user,
                field_name=field_name,
                old_value=old_value,
                new_value=field_value,
                version=content.version
            )
        
        self.broadcast_update(content.form, field_name, field_value, request.user)
        
        return Response({
            'success': True,
            'version': content.version,
            'field_name': field_name,
            'field_value': field_value
        })
    
    def has_field_edit_permission(self, form, field_name):
        """Check if user has permission to edit this field"""
        membership = TeamMembership.objects.filter(
            user=self.request.user,
            team=form.team
        ).first()
        
        return membership and membership.role in ['owner', 'edit']
    
    def broadcast_update(self, form, field_name, field_value, user):
        """Broadcast update to other users via WebSocket"""
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"form_{form.id}",
            {
                'type': 'field_update',
                'field_name': field_name,
                'field_value': field_value,
                'user_id': user.id,
                'user_name': user.username,
                'timestamp': json.dumps(timezone.now(), default=str)
            }
        )

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def collaborative_form_batch_update(request, form_id):
    """Batch update multiple fields of the form"""
    form = get_object_or_404(Form, id=form_id)
    
    # Check permissions
    membership = TeamMembership.objects.filter(
        user=request.user,
        team=form.team
    ).first()
    
    if not membership:
        return Response(
            {'error': 'You are not a member of this team'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    if membership.role not in ['owner', 'edit']:
        return Response(
            {'error': 'No permission to edit this form'},
            status=status.HTTP_403_FORBIDDEN
        )
    

    content, created = FormContent.objects.get_or_create(
        form=form,
        defaults={
            'version': 1,
            'title': form.title,
        }
    )
    
    changes = request.data.get('changes', {})
    if not changes:
        return Response(
            {'error': 'No changes provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def get_field_default_value(field_name, current_value):
        """Return appropriate default value based on field type"""
        if current_value is None:
            boolean_fields = ['digital_actions', 'award']
            integer_fields = ['level', 'individual_organization', 'year']
            
            if field_name in boolean_fields:
                return False
            elif field_name in integer_fields:
                return 0
            else:
                return ''
        return current_value
    
    # Batch update multiple fields of the form
    with transaction.atomic():
        old_values = {}
        
        for field_name, field_value in changes.items():
            if hasattr(content, field_name):
                current_value = getattr(content, field_name, None)

                old_values[field_name] = get_field_default_value(field_name, current_value)
                

                if field_name in ['level', 'individual_organization']:

                    if field_value == '' or field_value is None:
                        field_value = None
                    else:
                        try:
                            field_value = int(field_value)
                        except (ValueError, TypeError):
                            field_value = None
                elif field_name in ['digital_actions', 'award']:
                    if isinstance(field_value, str):
                        if field_value == '1' or field_value.lower() == 'true':
                            field_value = True
                        elif field_value == '0' or field_value.lower() == 'false':
                            field_value = False
                        else:
                            field_value = bool(field_value)
                
                setattr(content, field_name, field_value)
                

                if field_name == 'title' and field_value:
                    content.form.title = field_value
                    content.form.save(update_fields=['title'])
        

        content.version += 1
        content.save()
        

        history_records = []
        for field_name, field_value in changes.items():
            if field_name in old_values:
                old_val = old_values[field_name]
                new_val = field_value
                

                if old_val is None:
                    old_val = ''
                if new_val is None:
                    new_val = ''
                
           
                history_records.append(FormEditHistory(
                    form=content.form,
                    user=request.user,
                    field_name=field_name,
                    old_value=str(old_val),
                    new_value=str(new_val),
                    version=content.version
                ))
        
        if history_records:
            FormEditHistory.objects.bulk_create(history_records)
    
    # Broadcast batch update via WebSocket

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"form_{form.id}",
        {
            'type': 'batch_update',
            'changes': changes,
            'version': content.version,
            'user_id': request.user.id,
            'user_name': request.user.username,
            'timestamp': json.dumps(timezone.now(), default=str)
        }
    )
    
    return Response({
        'success': True,
        'version': content.version,
        'changes_count': len(changes),
        'updated_fields': list(changes.keys())
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_edit_session(request, form_id):
    """Start an edit session"""
    form = get_object_or_404(Form, id=form_id)
    field_name = request.data.get('field_name')
    

    session, created = FormEditSession.objects.update_or_create(
        form=form,
        user=request.user,
        defaults={
            'field_name': field_name,
            'is_active': True,
            'cursor_position': request.data.get('cursor_position', 0)
        }
    )
    
    # Broadcast editing status

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"form_{form.id}",
        {
            'type': 'user_editing',
            'user_id': request.user.id,
            'user_name': request.user.username,
            'field_name': field_name,
            'cursor_position': session.cursor_position
        }
    )
    
    return Response({'success': True})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def end_edit_session(request, form_id):
    """End edit session"""
    form = get_object_or_404(Form, id=form_id)
    
    FormEditSession.objects.filter(
        form=form,
        user=request.user
    ).update(is_active=False)
    
    # Broadcast that editing has ended

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"form_{form.id}",
        {
            'type': 'user_stopped_editing',
            'user_id': request.user.id,
            'user_name': request.user.username
        }
    )
    
    return Response({'success': True})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_active_editors(request, form_id):
    """Get list of currently active editors"""
    form = get_object_or_404(Form, id=form_id)
    
    sessions = FormEditSession.objects.filter(
        form=form,
        is_active=True
    ).select_related('user')
    
    serializer = FormEditSessionSerializer(sessions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def export_form_pdf(request, form_id):
    form = get_object_or_404(Form, id=form_id)
    content = get_object_or_404(FormContent, form=form)
    
    if form.type == 'blank':
        template_name = 'exports/blank_form.html'
        context = {
            'title': content.title or form.title,
            'description': content.description or form.description,
            'content_html': markdown.markdown(content.free_content) if content.free_content else '',
            'form': form,
        }
    elif form.type == 'action':
        template_name = 'exports/action_form.html'
        context = {
            'form': form,
            'content': content,
            'sections': [
                ('Basic Information', [
                    ('Title', content.title),
                    ('Description', content.description),
                    ('Location', content.location),
                    ('Organization', content.organization),
                    ('Year', content.year),
                ]),
                ('Action Details', [
                    ('Actions', content.actions),
                    ('Action Detail', content.action_detail),
                    ('Level', content.level),
                    ('Individual/Organization', content.individual_organization),
                    ('Related Industry', content.related_industry),
                    ('Digital Actions', 'Yes' if content.digital_actions else 'No'),
                ]),
                ('Additional Information', [
                    ('SDGs Related', content.sdgs_related),
                    ('Source Descriptions', content.source_descriptions),
                    ('Award', 'Yes' if content.award else 'No'),
                    ('Source Links', content.source_links),
                    ('Additional Notes', content.additional_notes),
                    ('Award Descriptions', content.award_descriptions),
                ])
            ]
        }
    elif form.type == 'ida':
        template_name = 'exports/ida_form.html'
        

        selected_sdgs_display = []
        if content.selected_sdgs:
            try:
                sdg_list = json.loads(content.selected_sdgs) if isinstance(content.selected_sdgs, str) else content.selected_sdgs
                for sdg_num in sdg_list:
                    selected_sdgs_display.append(f"SDG {sdg_num}")
            except:
                selected_sdgs_display = [content.selected_sdgs] if content.selected_sdgs else []
        
        impact_types_display = []
        if content.impact_types:
            try:
                impact_dict = json.loads(content.impact_types) if isinstance(content.impact_types, str) else content.impact_types
                impact_types_display = [f"{k}: {v}" for k, v in impact_dict.items()]
            except:
                impact_types_display = [content.impact_types] if content.impact_types else []
        
        context = {
            'form': form,
            'content': content,
            'selected_sdgs_display': ', '.join(selected_sdgs_display),
            'impact_types_display': ', '.join(impact_types_display),
            'sections': [
                ('Basic Information', [
                    ('Designer Names', content.designer_names),
                    ('Current Role and Affiliation', content.current_role_affiliation),
                ]),
                ('Project Overview', [
                    ('Impact Project Name', content.impact_project_name),
                    ('Main Challenge', content.main_challenge),
                    ('Project Description', content.project_description),
                    ('Selected SDGs', ', '.join(selected_sdgs_display)),
                    ('Impact Types', ', '.join(impact_types_display)),
                ]),
                ('Project Analysis', [
                    ('Project Importance', content.project_importance),
                    ('Existing Example', content.existing_example),
                ]),
                ('Implementation Steps', [
                    ('Step 1', content.implementation_step1),
                    ('Step 2', content.implementation_step2),
                    ('Step 3', content.implementation_step3),
                    ('Step 4', content.implementation_step4),
                    ('Step 5', content.implementation_step5),
                    ('Step 6', content.implementation_step6),
                ]),
                ('Resources and Assessment', [
                    ('Resources & Partnerships', content.resources_partnerships),
                    ('Skills & Capabilities', content.skills_capabilities),
                    ('Impact Avenues', content.impact_avenues),
                    ('Risks & Inhibitors', content.risks_inhibitors),
                    ('Mitigation Strategies', content.mitigation_strategies),
                ])
            ]
        }
    else:  # education
        template_name = 'exports/education_form.html'
        context = {
            'form': form,
            'content': content,
            'sections': [
                ('Basic Information', [
                    ('Title', content.title),
                    ('Description', content.description),
                    ('Location', content.location),
                    ('Organization', content.organization),
                    ('Year', content.year),
                ]),
                ('Educational Content', [
                    ('Aims', content.aims),
                    ('Learning Outcomes', content.learning_outcomes),
                    ('Type Label', content.type_label),
                    ('Related Discipline', content.related_discipline),
                    ('Useful Industries', content.useful_industries),
                ]),
                ('Resource Information', [
                    ('SDGs Related', content.sdgs_related),
                    ('Source', content.source),
                    ('Link', content.link),
                ])
            ]
        }
    
    # HTML
    html_string = render_to_string(template_name, context)
    
    # PDF
    pdf = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()
    
    response = HttpResponse(pdf, content_type='application/pdf')
    filename = f"{form.title or 'form'}_{form.id}.pdf"
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def export_ida_ppt(request, form_id):
    """Export IDA form to PPT format"""
    form = get_object_or_404(Form, id=form_id)
    
    if form.type != 'ida':
        return Response(
            {'error': 'PPT export is only available for IDA forms'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    content = get_object_or_404(FormContent, form=form)
    
    # PPT
    ppt_file = create_ida_presentation(form, content)
    
    # return PPT
    response = HttpResponse(
        ppt_file.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.presentationml.presentation'
    )
    safe_title = (content.title or form.title or 'IDA_Form').replace(' ', '_')[:50]
    filename = f"{safe_title}_{form.id}.pptx"
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response

def create_ida_presentation(form, content):
    """Create PowerPoint presentation for IDA analysis"""
    prs = Presentation()
    
    prs.slide_width = Inches(13.33)
    prs.slide_height = Inches(7.5)

    create_title_slide(prs, form, content)
    
    create_overview_slide(prs, content)
    
    create_roadmap_slide(prs, content)
    
    create_assessment_slide(prs, content)
    
    create_risk_slide(prs, content)
    
    ppt_file = io.BytesIO()
    prs.save(ppt_file)
    ppt_file.seek(0)
    
    return ppt_file

def create_title_slide(prs, form, content):
    """Create title slide"""
    slide_layout = prs.slide_layouts[6]  
    slide = prs.slides.add_slide(slide_layout)
    
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = RGBColor(252, 251, 247) 
    
    header_bar = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        Inches(0), Inches(0), Inches(13.33), Inches(0.8)
    )
    header_fill = header_bar.fill
    header_fill.solid()
    header_fill.fore_color.rgb = RGBColor(139, 134, 128) 
    

    title_box = slide.shapes.add_textbox(Inches(1), Inches(1.5), Inches(11.33), Inches(1.2))
    title_frame = title_box.text_frame
    title_p = title_frame.paragraphs[0]
    title_p.text = "IMPACT DESIGN ANALYSIS"
    title_p.font.size = Pt(42)
    title_p.font.bold = True
    title_p.font.color.rgb = RGBColor(87, 83, 78) 
    title_p.alignment = PP_ALIGN.CENTER
    

    subtitle_box = slide.shapes.add_textbox(Inches(1), Inches(2.8), Inches(11.33), Inches(0.8))
    subtitle_frame = subtitle_box.text_frame
    subtitle_p = subtitle_frame.paragraphs[0]
    subtitle_p.text = "SDG Action Plan & Impact Assessment"
    subtitle_p.font.size = Pt(20)
    subtitle_p.font.color.rgb = RGBColor(120, 113, 108)  
    subtitle_p.alignment = PP_ALIGN.CENTER
    

    info_card = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        Inches(2.5), Inches(4), Inches(8.33), Inches(2.5)
    )
    info_fill = info_card.fill
    info_fill.solid()
    info_fill.fore_color.rgb = RGBColor(255, 254, 251)  
    info_card.line.color.rgb = RGBColor(214, 211, 209)  
    info_card.line.width = Pt(1)
    

    info_frame = info_card.text_frame
    info_frame.margin_left = Inches(0.5)
    info_frame.margin_top = Inches(0.3)
    info_frame.margin_right = Inches(0.5)
    info_frame.margin_bottom = Inches(0.3)
    

    p1 = info_frame.paragraphs[0]
    p1.text = content.title or "IDA Analysis Document"
    p1.font.size = Pt(18)
    p1.font.bold = True
    p1.font.color.rgb = RGBColor(87, 83, 78)
    p1.alignment = PP_ALIGN.CENTER
    

    if content.description:
        p2 = info_frame.add_paragraph()
        desc_text = content.description[:80] + "..." if len(content.description) > 80 else content.description
        p2.text = desc_text
        p2.font.size = Pt(14)
        p2.font.color.rgb = RGBColor(120, 113, 108)
        p2.alignment = PP_ALIGN.CENTER
    

    p3 = info_frame.add_paragraph()
    p3.text = f"Designer: {content.designer_names or 'Not specified'}"
    p3.font.size = Pt(12)
    p3.font.color.rgb = RGBColor(146, 142, 138)
    p3.alignment = PP_ALIGN.CENTER
    

    p4 = info_frame.add_paragraph()
    p4.text = f"Created: {form.created_at.strftime('%B %d, %Y')}"
    p4.font.size = Pt(12)
    p4.font.color.rgb = RGBColor(146, 142, 138)
    p4.alignment = PP_ALIGN.CENTER
    

    if content.selected_sdgs:
        try:
            sdg_list = json.loads(content.selected_sdgs) if isinstance(content.selected_sdgs, str) else content.selected_sdgs
            if sdg_list:
                sdg_text = f"SDGs: {', '.join([f'SDG {sdg}' for sdg in sdg_list[:3]])}"
                p5 = info_frame.add_paragraph()
                p5.text = sdg_text
                p5.font.size = Pt(12)
                p5.font.bold = True
                p5.font.color.rgb = RGBColor(139, 134, 128)
                p5.alignment = PP_ALIGN.CENTER
        except:
            pass

def create_overview_slide(prs, content):
    """Create overview slide (card layout)"""
    slide_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(slide_layout)
    

    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = RGBColor(252, 251, 247)
    

    header_bar = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        Inches(0), Inches(0), Inches(13.33), Inches(0.6)
    )
    header_fill = header_bar.fill
    header_fill.solid()
    header_fill.fore_color.rgb = RGBColor(139, 134, 128)
    

    title_box = slide.shapes.add_textbox(Inches(1), Inches(0.8), Inches(11.33), Inches(0.8))
    title_frame = title_box.text_frame
    title_p = title_frame.paragraphs[0]
    title_p.text = "PROJECT OVERVIEW"
    title_p.font.size = Pt(28)
    title_p.font.bold = True
    title_p.font.color.rgb = RGBColor(87, 83, 78)
    title_p.alignment = PP_ALIGN.CENTER
    

    cards = [
        {
            'title': 'Main Challenge',
            'content': content.main_challenge or 'Not specified',
            'color': RGBColor(169, 156, 141),  
            'pos': (1, 2.2, 3.7, 2)
        },
        {
            'title': 'Project Description', 
            'content': content.project_description or 'Not specified',
            'color': RGBColor(147, 149, 151),  
            'pos': (4.9, 2.2, 3.7, 2)
        },
        {
            'title': 'Why Important',
            'content': content.project_importance or 'Not specified', 
            'color': RGBColor(156, 153, 136),  
            'pos': (8.8, 2.2, 3.7, 2)
        },
        {
            'title': 'Existing Example',
            'content': content.existing_example or 'Not specified',
            'color': RGBColor(176, 151, 128),  
            'pos': (1, 4.5, 3.7, 2)
        },
        {
            'title': 'Resources Needed',
            'content': content.resources_partnerships or 'Not specified',
            'color': RGBColor(163, 141, 156),  
            'pos': (4.9, 4.5, 3.7, 2)
        },
        {
            'title': 'Impact Pathways',
            'content': content.impact_avenues or 'Not specified',
            'color': RGBColor(153, 156, 141),  
            'pos': (8.8, 4.5, 3.7, 2)
        }
    ]
    

    for card in cards:
        card_shape = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE,
            Inches(card['pos'][0]), Inches(card['pos'][1]),
            Inches(card['pos'][2]), Inches(card['pos'][3])
        )
        

        fill = card_shape.fill
        fill.solid()
        fill.fore_color.rgb = card['color']
        

        card_shape.line.color.rgb = RGBColor(255, 254, 251)
        card_shape.line.width = Pt(2)
        
 
        text_frame = card_shape.text_frame
        text_frame.margin_left = Inches(0.2)
        text_frame.margin_right = Inches(0.2)
        text_frame.margin_top = Inches(0.2)
        text_frame.margin_bottom = Inches(0.2)
        

        title_p = text_frame.paragraphs[0]
        title_p.text = card['title']
        title_p.font.size = Pt(14)
        title_p.font.bold = True
        title_p.font.color.rgb = RGBColor(255, 254, 251)
        title_p.alignment = PP_ALIGN.CENTER
        

        content_p = text_frame.add_paragraph()
        content_text = card['content'][:80] + "..." if len(card['content']) > 80 else card['content']
        content_p.text = content_text
        content_p.font.size = Pt(10)
        content_p.font.color.rgb = RGBColor(255, 254, 251)

def create_roadmap_slide(prs, content):
    """Create implementation roadmap slide"""
    slide_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(slide_layout)
    

    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = RGBColor(252, 251, 247)
    

    header_bar = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        Inches(0), Inches(0), Inches(13.33), Inches(0.6)
    )
    header_fill = header_bar.fill
    header_fill.solid()
    header_fill.fore_color.rgb = RGBColor(139, 134, 128)
    

    title_box = slide.shapes.add_textbox(Inches(1), Inches(0.8), Inches(11.33), Inches(0.8))
    title_frame = title_box.text_frame
    title_p = title_frame.paragraphs[0]
    title_p.text = "IMPLEMENTATION ROADMAP"
    title_p.font.size = Pt(28)
    title_p.font.bold = True
    title_p.font.color.rgb = RGBColor(87, 83, 78)
    title_p.alignment = PP_ALIGN.CENTER
    

    steps = [

        {'title': 'Step 1', 'content': content.implementation_step1, 'pos': (2.2, 2.2), 'color': RGBColor(169, 156, 141)},
        {'title': 'Step 2', 'content': content.implementation_step2, 'pos': (5.2, 2.2), 'color': RGBColor(147, 149, 151)}, 
        {'title': 'Step 3', 'content': content.implementation_step3, 'pos': (8.2, 2.2), 'color': RGBColor(156, 153, 136)},

        {'title': 'Step 4', 'content': content.implementation_step4, 'pos': (8.2, 4.8), 'color': RGBColor(176, 151, 128)},
        {'title': 'Step 5', 'content': content.implementation_step5, 'pos': (5.2, 4.8), 'color': RGBColor(163, 141, 156)},
        {'title': 'Step 6', 'content': content.implementation_step6, 'pos': (2.2, 4.8), 'color': RGBColor(153, 156, 141)}
    ]
    

    line1 = slide.shapes.add_connector(
        1,
        Inches(4.0), Inches(2.9),  
        Inches(5.2), Inches(2.9)  
    )
    line1.line.color.rgb = RGBColor(193, 181, 171)
    line1.line.width = Pt(3)
    

    line2 = slide.shapes.add_connector(
        1,
        Inches(7.0), Inches(2.9),  
        Inches(8.2), Inches(2.9)   
    )
    line2.line.color.rgb = RGBColor(193, 181, 171)
    line2.line.width = Pt(3)
    

    vertical_line = slide.shapes.add_connector(
        1,
        Inches(9.1), Inches(4.0), 
        Inches(9.1), Inches(4.8)  
    )
    vertical_line.line.color.rgb = RGBColor(193, 181, 171)
    vertical_line.line.width = Pt(3)
    

    line4 = slide.shapes.add_connector(
        1,
        Inches(8.2), Inches(5.7),  
        Inches(7.0), Inches(5.7)   
    )
    line4.line.color.rgb = RGBColor(193, 181, 171)
    line4.line.width = Pt(3)
    

    line5 = slide.shapes.add_connector(
        1,
        Inches(5.2), Inches(5.7),  
        Inches(4.0), Inches(5.7)  
    )
    line5.line.color.rgb = RGBColor(193, 181, 171)
    line5.line.width = Pt(3)
    

    for step in steps:

        circle = slide.shapes.add_shape(
            MSO_SHAPE.OVAL,
            Inches(step['pos'][0]), Inches(step['pos'][1]),
            Inches(1.8), Inches(1.8)
        )
        
        fill = circle.fill
        fill.solid()
        fill.fore_color.rgb = step['color']
        

        circle.line.color.rgb = RGBColor(255, 254, 251)
        circle.line.width = Pt(4)
        

        text_frame = circle.text_frame
        text_frame.clear()  
        text_frame.margin_left = Inches(0.05)
        text_frame.margin_right = Inches(0.05) 
        text_frame.margin_top = Inches(0.15)
        text_frame.margin_bottom = Inches(0.05)
        text_frame.word_wrap = True
        

        title_p = text_frame.paragraphs[0]
        title_p.text = step['title']
        title_p.font.size = Pt(14)
        title_p.font.bold = True
        title_p.font.color.rgb = RGBColor(255, 254, 251)
        title_p.alignment = PP_ALIGN.CENTER
        

        content_p = text_frame.add_paragraph()
        step_content = step['content'] or "Not specified"
        

        if len(step_content) > 35:
            words = step_content.split()
            truncated = []
            char_count = 0
            for word in words:
                if char_count + len(word) + 1 <= 35:  # +1 for space
                    truncated.append(word)
                    char_count += len(word) + 1
                else:
                    break
            preview_text = ' '.join(truncated) + "..."
        else:
            preview_text = step_content
            
        content_p.text = preview_text
        content_p.font.size = Pt(10)
        content_p.font.color.rgb = RGBColor(255, 254, 251)
        content_p.alignment = PP_ALIGN.CENTER
        
        if len(preview_text) > 15:
            content_p.font.size = Pt(9)

def create_assessment_slide(prs, content):
    """Create resources and assessment slide"""
    slide_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(slide_layout)
    

    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = RGBColor(252, 251, 247)

    header_bar = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        Inches(0), Inches(0), Inches(13.33), Inches(0.6)
    )
    header_fill = header_bar.fill
    header_fill.solid()
    header_fill.fore_color.rgb = RGBColor(139, 134, 128)

    title_box = slide.shapes.add_textbox(Inches(1), Inches(0.8), Inches(11.33), Inches(0.8))
    title_frame = title_box.text_frame
    title_p = title_frame.paragraphs[0]
    title_p.text = "STRATEGIC ASSESSMENT"
    title_p.font.size = Pt(28)
    title_p.font.bold = True
    title_p.font.color.rgb = RGBColor(87, 83, 78)
    title_p.alignment = PP_ALIGN.CENTER

    assessments = [
        {
            'title': 'Resources &\nPartnerships',
            'content': content.resources_partnerships or 'Not specified',
            'color': RGBColor(169, 156, 141),  
            'pos': (1, 2.2, 3.7, 4)
        },
        {
            'title': 'Skills &\nCapabilities', 
            'content': content.skills_capabilities or 'Not specified',
            'color': RGBColor(156, 153, 136),  
            'pos': (4.9, 2.2, 3.7, 4)
        },
        {
            'title': 'Impact\nAvenues',
            'content': content.impact_avenues or 'Not specified',
            'color': RGBColor(176, 151, 128), 
            'pos': (8.8, 2.2, 3.7, 4)
        }
    ]
    
    for assessment in assessments:
        card = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE,
            Inches(assessment['pos'][0]), Inches(assessment['pos'][1]),
            Inches(assessment['pos'][2]), Inches(assessment['pos'][3])
        )
        
        fill = card.fill
        fill.solid()
        fill.fore_color.rgb = assessment['color']
  
        card.line.color.rgb = RGBColor(255, 254, 251)
        card.line.width = Pt(3)

        text_frame = card.text_frame
        text_frame.margin_left = Inches(0.3)
        text_frame.margin_right = Inches(0.3)
        text_frame.margin_top = Inches(0.3)
        text_frame.margin_bottom = Inches(0.3)

        title_p = text_frame.paragraphs[0]
        title_p.text = assessment['title']
        title_p.font.size = Pt(16)
        title_p.font.bold = True
        title_p.font.color.rgb = RGBColor(255, 254, 251)
        title_p.alignment = PP_ALIGN.CENTER

        content_p = text_frame.add_paragraph()
        content_text = assessment['content'][:150] + "..." if len(assessment['content']) > 150 else assessment['content']
        content_p.text = content_text
        content_p.font.size = Pt(11)
        content_p.font.color.rgb = RGBColor(255, 254, 251)

def create_risk_slide(prs, content):
    """Create risk assessment slide"""
    slide_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(slide_layout)

    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = RGBColor(252, 251, 247)

    header_bar = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        Inches(0), Inches(0), Inches(13.33), Inches(0.6)
    )
    header_fill = header_bar.fill
    header_fill.solid()
    header_fill.fore_color.rgb = RGBColor(139, 134, 128)

    title_box = slide.shapes.add_textbox(Inches(1), Inches(0.8), Inches(11.33), Inches(0.8))
    title_frame = title_box.text_frame
    title_p = title_frame.paragraphs[0]
    title_p.text = "RISK ASSESSMENT & MITIGATION"
    title_p.font.size = Pt(28)
    title_p.font.bold = True
    title_p.font.color.rgb = RGBColor(87, 83, 78)
    title_p.alignment = PP_ALIGN.CENTER

    risk_box = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        Inches(1), Inches(2.2), Inches(5.5), Inches(4)
    )
    risk_fill = risk_box.fill
    risk_fill.solid()
    risk_fill.fore_color.rgb = RGBColor(186, 151, 143)  

    risk_box.line.color.rgb = RGBColor(255, 254, 251)
    risk_box.line.width = Pt(3)

    risk_frame = risk_box.text_frame
    risk_frame.margin_left = Inches(0.3)
    risk_frame.margin_top = Inches(0.3)
    risk_frame.margin_right = Inches(0.3)
    risk_frame.margin_bottom = Inches(0.3)
    
    risk_title = risk_frame.paragraphs[0]
    risk_title.text = "RISKS & INHIBITORS"
    risk_title.font.size = Pt(18)
    risk_title.font.bold = True
    risk_title.font.color.rgb = RGBColor(255, 254, 251)
    risk_title.alignment = PP_ALIGN.CENTER
    
    risk_content = risk_frame.add_paragraph()
    risk_text = content.risks_inhibitors or "No risks identified"
    risk_content.text = risk_text[:200] + "..." if len(risk_text) > 200 else risk_text
    risk_content.font.size = Pt(12)
    risk_content.font.color.rgb = RGBColor(255, 254, 251)

    mitigation_box = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        Inches(6.8), Inches(2.2), Inches(5.5), Inches(4)
    )
    mitigation_fill = mitigation_box.fill
    mitigation_fill.solid()
    mitigation_fill.fore_color.rgb = RGBColor(156, 174, 146)  

    mitigation_box.line.color.rgb = RGBColor(255, 254, 251)
    mitigation_box.line.width = Pt(3)

    mitigation_frame = mitigation_box.text_frame
    mitigation_frame.margin_left = Inches(0.3)
    mitigation_frame.margin_top = Inches(0.3)
    mitigation_frame.margin_right = Inches(0.3)
    mitigation_frame.margin_bottom = Inches(0.3)
    
    mitigation_title = mitigation_frame.paragraphs[0]
    mitigation_title.text = "MITIGATION STRATEGIES"
    mitigation_title.font.size = Pt(18)
    mitigation_title.font.bold = True
    mitigation_title.font.color.rgb = RGBColor(255, 254, 251)
    mitigation_title.alignment = PP_ALIGN.CENTER
    
    mitigation_content = mitigation_frame.add_paragraph()
    mitigation_text = content.mitigation_strategies or "No mitigation strategies defined"
    mitigation_content.text = mitigation_text[:200] + "..." if len(mitigation_text) > 200 else mitigation_text
    mitigation_content.font.size = Pt(12)
    mitigation_content.font.color.rgb = RGBColor(255, 254, 251)