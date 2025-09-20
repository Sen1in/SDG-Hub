from django.core.management.base import BaseCommand
from django.conf import settings
from apps.education.models import EducationDb
from apps.actions.models import ActionDb
from apps.keywords.models import KeywordResource

try:
    from meilisearch import Client
    MEILISEARCH_AVAILABLE = True
except ImportError:
    MEILISEARCH_AVAILABLE = False


class Command(BaseCommand):
    help = 'Index resources into Meilisearch'

    def handle(self, *args, **options):
        if not MEILISEARCH_AVAILABLE:
            self.stdout.write(self.style.ERROR('Meilisearch not available'))
            return

        client = Client(settings.MEILI_HOST, settings.MEILI_KEY)
        index = client.index(settings.SEARCH_INDEX_NAME)
        
        index.delete_all_documents()
        documents = []
        
        for education in EducationDb.objects.all():
            title = education.title or f'Education {education.id}'
            description = education.description or education.aims or ''
            summary = description[:200] + ('...' if len(description) > 200 else '') if description else title
            documents.append({
                'id': f'education-{education.id}',
                'type': 'education',
                'title': title,
                'summary': summary,
                'content': f'{title} {description}',
                'url': f'/education/{education.id}/'
            })

        for action in ActionDb.objects.all():
            title = action.actions or f'Action {action.id}'
            description = action.action_detail or ''
            summary = description[:200] + ('...' if len(description) > 200 else '') if description else title
            documents.append({
                'id': f'action-{action.id}',
                'type': 'action', 
                'title': title,
                'summary': summary,
                'content': f'{title} {description}',
                'url': f'/actions/{action.id}/'
            })

        processed = set()
        for keyword in KeywordResource.objects.order_by('keyword'):
            if keyword.keyword and keyword.keyword.lower() not in processed:
                processed.add(keyword.keyword.lower())
                # Create safe ID by removing all non-alphanumeric characters except hyphens and underscores
                import re
                safe_name = re.sub(r'[^a-zA-Z0-9_-]', '_', keyword.keyword.lower())[:50]
                # Remove multiple consecutive underscores
                safe_name = re.sub(r'_+', '_', safe_name).strip('_')
                documents.append({
                    'id': f'keyword-{safe_name}',
                    'type': 'keyword',
                    'title': keyword.keyword,
                    'summary': keyword.keyword,
                    'content': keyword.keyword,
                    'url': f'/keywords?search={keyword.keyword}'
                })

        if documents:
            self.stdout.write(f'Attempting to index {len(documents)} documents...')
            result = index.add_documents(documents)
            self.stdout.write(f'Index result: {result}')
            self.stdout.write(self.style.SUCCESS(f'Indexed {len(documents)} documents'))
        else:
            self.stdout.write(self.style.WARNING('No documents to index!'))
