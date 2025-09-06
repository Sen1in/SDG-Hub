# apps/notifications/management/commands/cleanup_expired.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.notifications.models import Notification, PendingEmailInvitation

class Command(BaseCommand):
    help = 'Clean up expired notifications and email invitations'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )
    
    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('DRY RUN MODE - Nothing will be deleted')
            )
        
        # 清理过期通知
        notifications_count = Notification.cleanup_expired_notifications()
        if not dry_run:
            self.stdout.write(
                self.style.SUCCESS(f'Deleted {notifications_count} expired notifications')
            )
        else:
            expired_notifications = Notification.objects.filter(
                expires_at__lt=timezone.now(),
                status='pending'
            ).count()
            self.stdout.write(
                self.style.WARNING(f'Would delete {expired_notifications} expired notifications')
            )
        
        # 清理过期邮件邀请
        if not dry_run:
            invitations_count = PendingEmailInvitation.cleanup_expired_invitations()
            self.stdout.write(
                self.style.SUCCESS(f'Deleted {invitations_count} expired email invitations')
            )
        else:
            expired_invitations = PendingEmailInvitation.objects.filter(
                expires_at__lt=timezone.now(),
                status='pending'
            ).count()
            self.stdout.write(
                self.style.WARNING(f'Would delete {expired_invitations} expired email invitations')
            )
        
        self.stdout.write(
            self.style.SUCCESS('Cleanup completed successfully')
        )