import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Form, FormEditSession

class FormCollaborationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.form_id = self.scope['url_route']['kwargs']['form_id']
        self.room_group_name = f'form_{self.form_id}'
        
        # Verify user permissions
        if not await self.has_permission():
            await self.close()
            return
        
        # Join group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send the list of currently active editors
        await self.send_active_editors()
    
    async def disconnect(self, close_code):
        # End the editing session
        await self.end_user_session()
        
        # Leaving Room Group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']
        
        if message_type == 'start_editing':
            await self.handle_start_editing(text_data_json)
        elif message_type == 'stop_editing':
            await self.handle_stop_editing(text_data_json)
        elif message_type == 'cursor_move':
            await self.handle_cursor_move(text_data_json)
        elif message_type == 'field_update':
            await self.handle_field_update(text_data_json)
        elif message_type == 'batch_update':
            await self.handle_batch_update(text_data_json)
    
    async def handle_start_editing(self, data):
        field_name = data.get('field_name')
        cursor_position = data.get('cursor_position', 0)
        
        await self.update_edit_session(field_name, cursor_position)
        
        # Broadcast to other users
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_editing',
                'user_id': self.scope['user'].id,
                'user_name': self.scope['user'].username,
                'field_name': field_name,
                'cursor_position': cursor_position
            }
        )

    async def handle_stop_editing(self, data):
        """Stop editing processing"""
        await self.end_user_session()
        
        # Broadcast to other users
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_stopped_editing',
                'user_id': self.scope['user'].id,
                'user_name': self.scope['user'].username
            }
        )
    
    async def handle_cursor_move(self, data):
        field_name = data.get('field_name')
        cursor_position = data.get('cursor_position', 0)
        selection_start = data.get('selection_start')
        selection_end = data.get('selection_end')
        
        await self.update_cursor_position(field_name, cursor_position, selection_start, selection_end)
        
        # Broadcast cursor position
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'cursor_update',
                'user_id': self.scope['user'].id,
                'user_name': self.scope['user'].username,
                'field_name': field_name,
                'cursor_position': cursor_position,
                'selection_start': selection_start,
                'selection_end': selection_end
            }
        )

    async def handle_field_update(self, data):
        """Handling updates for individual fields"""
        field_name = data.get('field_name')
        field_value = data.get('field_value')
        
        if not field_name:
            return
        
        # Broadcast to other users
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'field_update',
                'field_name': field_name,
                'field_value': field_value,
                'user_id': self.scope['user'].id,
                'user_name': self.scope['user'].username,
                'timestamp': json.dumps(timezone.now(), default=str)
            }
        )

    async def handle_batch_update(self, data):
        """Handle batch field updates"""
        changes = data.get('changes', {})
        
        if not changes:
            return
        
        # Broadcast to other users
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'batch_update',
                'changes': changes,
                'user_id': self.scope['user'].id,
                'user_name': self.scope['user'].username,
                'timestamp': json.dumps(timezone.now(), default=str)
            }
        )
    
    # WebSocket event handler
    async def field_update(self, event):
        """Handle the event of updating a single field"""
        # Do not send to myself
        if event['user_id'] != self.scope['user'].id:
            await self.send(text_data=json.dumps({
                'type': 'field_update',
                'field_name': event['field_name'],
                'field_value': event['field_value'],
                'user_id': event['user_id'],
                'user_name': event['user_name'],
                'timestamp': event['timestamp']
            }))

    async def batch_update(self, event):
        """Handle batch field update events"""
        # Do not send to myself
        if event['user_id'] != self.scope['user'].id:
            await self.send(text_data=json.dumps({
                'type': 'batch_update',
                'changes': event['changes'],
                'user_id': event['user_id'],
                'user_name': event['user_name'],
                'timestamp': event['timestamp']
            }))
    
    async def user_editing(self, event):
        # Do not send to myself
        if event['user_id'] != self.scope['user'].id:
            await self.send(text_data=json.dumps({
                'type': 'user_editing',
                'user_id': event['user_id'],
                'user_name': event['user_name'],
                'field_name': event['field_name'],
                'cursor_position': event['cursor_position']
            }))
    
    async def user_stopped_editing(self, event):
        """Handle the broadcast messages that have been stopped being edited by the user"""
        # Do not send to myself
        if event['user_id'] != self.scope['user'].id:
            await self.send(text_data=json.dumps({
                'type': 'user_stopped_editing',
                'user_id': event['user_id'],
                'user_name': event['user_name']
            }))
    
    async def cursor_update(self, event):
        # Do not send to myself
        if event['user_id'] != self.scope['user'].id:
            await self.send(text_data=json.dumps({
                'type': 'cursor_update',
                'user_id': event['user_id'],
                'user_name': event['user_name'],
                'field_name': event['field_name'],
                'cursor_position': event['cursor_position'],
                'selection_start': event.get('selection_start'),
                'selection_end': event.get('selection_end')
            }))

    async def version_saved(self, event):
        """Handle version save confirmation event"""
        await self.send(text_data=json.dumps({
            'type': 'version_saved',
            'version': event['version'],
            'user_id': event['user_id'],
            'user_name': event['user_name'],
            'timestamp': event['timestamp']
        }))
    
    # Database operations
    @database_sync_to_async
    def has_permission(self):
        try:
            from apps.team.models import TeamMembership
            
            # Obtain the real user ID
            user = self.scope['user']
            if not user or not user.is_authenticated:
                print(f"Permission denied: User not authenticated")
                return False
            
            # Ensure the acquisition of genuine user IDs
            user_id = user.id if hasattr(user, 'id') else None
            if not user_id:
                print(f"Permission denied: No user ID found")
                return False
            
            form = Form.objects.get(id=self.form_id)
            
            # Use the user ID instead of the user object
            membership = TeamMembership.objects.filter(
                user_id=user_id,
                team=form.team
            ).first()
            
            if not membership:
                print(f"Permission denied: User {user_id} is not a team member")
                return False
                
            has_edit_permission = membership.role in ['owner', 'edit']
            if not has_edit_permission:
                print(f"Permission denied: User {user_id} has role '{membership.role}', needs 'owner' or 'edit'")
                
            return has_edit_permission
            
        except Form.DoesNotExist:
            print(f"Permission denied: Form {self.form_id} not found")
            return False
        except Exception as e:
            print(f"Permission check error: {e}")
            return False
    
    @database_sync_to_async
    def update_edit_session(self, field_name, cursor_position):
        user_id = self.scope['user'].id if hasattr(self.scope['user'], 'id') else None
        if user_id:
            FormEditSession.objects.update_or_create(
                form_id=self.form_id,
                user_id=user_id,  
                defaults={
                    'field_name': field_name,
                    'cursor_position': cursor_position,
                    'is_active': True
                }
            )
    
    @database_sync_to_async
    def update_cursor_position(self, field_name, cursor_position, selection_start, selection_end):
        user_id = self.scope['user'].id if hasattr(self.scope['user'], 'id') else None
        if user_id:
            FormEditSession.objects.filter(
                form_id=self.form_id,
                user_id=user_id  
            ).update(
                field_name=field_name,
                cursor_position=cursor_position,
                selection_start=selection_start,
                selection_end=selection_end
            )
    
    @database_sync_to_async
    def end_user_session(self):
        # Obtain the real user ID
        user_id = self.scope['user'].id if hasattr(self.scope['user'], 'id') else None
        if user_id:
            FormEditSession.objects.filter(
                form_id=self.form_id,
                user_id=user_id  
            ).update(is_active=False)
    
    @database_sync_to_async
    def get_active_editors(self):
        sessions = FormEditSession.objects.filter(
            form_id=self.form_id,
            is_active=True
        ).select_related('user')
        
        return [{
            'user_id': session.user.id,
            'user_name': session.user.username,
            'field_name': session.field_name,
            'cursor_position': session.cursor_position
        } for session in sessions]
    
    async def send_active_editors(self):
        editors = await self.get_active_editors()
        await self.send(text_data=json.dumps({
            'type': 'active_editors',
            'editors': editors
        }))