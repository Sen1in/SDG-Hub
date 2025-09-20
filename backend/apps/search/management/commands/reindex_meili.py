"""
Management command to reindex all content in Meilisearch
"""
import logging
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from meilisearch import Client
from meilisearch.errors import MeilisearchError

# Import the actual model classes
from apps.education.models import EducationDb
from apps.actions.models import ActionDb
from apps.keywords.models import KeywordResource

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Reindex all content in Meilisearch for instant search'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear the index before reindexing',
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=1000,
            help='Number of documents to index at once (default: 1000)',
        )

    def handle(self, *args, **options):
        try:
            # Initialize Meilisearch client
            client = Client(settings.MEILI_HOST, settings.MEILI_KEY)
            index = client.index(settings.SEARCH_INDEX_NAME)
            
            self.stdout.write(
                self.style.SUCCESS(f'Connecting to Meilisearch at {settings.MEILI_HOST}')
            )

            # Clear index if requested
            if options['clear']:
                self.stdout.write('Clearing existing index...')
                try:
                    index.delete_all_documents()
                    self.stdout.write(self.style.SUCCESS('Index cleared.'))
                except MeilisearchError as e:
                    self.stdout.write(self.style.WARNING(f'Could not clear index: {e}'))

            # Configure index settings
            self.stdout.write('Configuring index settings...')
            index.update_settings({
                "searchableAttributes": ["title", "summary", "content"],
                "displayedAttributes": ["id", "type", "title", "summary", "url"],
                "filterableAttributes": ["type"],
                "typoTolerance": {
                    "enabled": True,
                    "minWordSizeForTypos": {"oneTypo": 4, "twoTypos": 8}
                }
            })

            # Collect all documents
            documents = []
            batch_size = options['batch_size']

            # Index Education resources
            self.stdout.write('Processing Education resources...')
            education_count = 0
            for edu in EducationDb.objects.all():
                doc = self._create_education_doc(edu)
                if doc:
                    documents.append(doc)
                    education_count += 1
                    
                    if len(documents) >= batch_size:
                        self._index_batch(index, documents)
                        documents = []

            # Index Action resources
            self.stdout.write('Processing Action resources...')
            action_count = 0
            for action in ActionDb.objects.all():
                doc = self._create_action_doc(action)
                if doc:
                    documents.append(doc)
                    action_count += 1
                    
                    if len(documents) >= batch_size:
                        self._index_batch(index, documents)
                        documents = []

            # Index Keyword resources (deduplicated by keyword)
            self.stdout.write('Processing Keyword resources...')
            keyword_count = 0
            processed_keywords = {}  # Track processed keywords to avoid duplicates
            
            # Get keywords ordered by SDG number and target code to prefer specific targets
            for keyword in KeywordResource.objects.order_by('keyword', 'sdg_number', 'target_code'):
                keyword_text = keyword.keyword.lower().strip() if keyword.keyword else ''
                
                # Skip if we already processed this keyword
                if keyword_text in processed_keywords:
                    continue
                    
                doc = self._create_keyword_doc(keyword)
                if doc:
                    documents.append(doc)
                    keyword_count += 1
                    processed_keywords[keyword_text] = True
                    
                    if len(documents) >= batch_size:
                        self._index_batch(index, documents)
                        documents = []

            # Index remaining documents
            if documents:
                self._index_batch(index, documents)

            total_docs = education_count + action_count + keyword_count
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✅ Indexing completed!\n'
                    f'  📚 Education: {education_count} documents\n'
                    f'  🎯 Actions: {action_count} documents\n'
                    f'  🔍 Keywords: {keyword_count} documents\n'
                    f'  📊 Total: {total_docs} documents\n'
                )
            )

        except MeilisearchError as e:
            raise CommandError(f'Meilisearch error: {e}')
        except Exception as e:
            raise CommandError(f'Unexpected error: {e}')

    def _create_education_doc(self, edu):
        """Create a document for an education resource"""
        try:
            # Create summary from description/aims
            summary_parts = []
            if edu.descriptions:
                summary_parts.append(edu.descriptions[:200])
            elif edu.aims:
                summary_parts.append(edu.aims[:200])
            
            summary = ' '.join(summary_parts).strip()
            if len(summary) > 300:
                summary = summary[:297] + '...'

            # Create full content for search
            content_parts = [
                edu.title or '',
                edu.descriptions or '',
                edu.aims or '',
                edu.organization or '',
                edu.location or ''
            ]
            content = ' '.join(filter(None, content_parts))

            return {
                'id': f'education-{edu.id}',
                'type': 'education',
                'title': edu.title or f'Education Resource {edu.id}',
                'summary': summary,
                'content': content,
                'url': f'/education/{edu.id}'
            }
        except Exception as e:
            logger.warning(f'Error creating education doc for ID {edu.id}: {e}')
            return None

    def _create_action_doc(self, action):
        """Create a document for an action resource"""
        try:
            # Create summary from action_detail
            summary = action.action_detail or ''
            if len(summary) > 300:
                summary = summary[:297] + '...'

            # Create full content for search
            content_parts = [
                action.actions or '',
                action.action_detail or '',
                action.additional_notes or '',
                action.location_specific_actions_org_onlyonly_field or ''
            ]
            content = ' '.join(filter(None, content_parts))

            return {
                'id': f'action-{action.id}',
                'type': 'action',
                'title': action.actions or f'Action Resource {action.id}',
                'summary': summary,
                'content': content,
                'url': f'/actions/{action.id}'
            }
        except Exception as e:
            logger.warning(f'Error creating action doc for ID {action.id}: {e}')
            return None

    def _create_keyword_doc(self, keyword):
        """Create a document for a keyword resource"""
        try:
            keyword_text = keyword.keyword or f'Keyword Resource {keyword.id}'
            
            # Create summary from target description
            summary = keyword.target_description or ''
            if len(summary) > 300:
                summary = summary[:297] + '...'

            # Create full content for search
            content_parts = [
                keyword.keyword or '',
                keyword.target_description or '',
                f'SDG {keyword.sdg_number}' if keyword.sdg_number else '',
                keyword.target_code or ''
            ]
            content = ' '.join(filter(None, content_parts))

            # Use keyword text as part of ID to ensure uniqueness
            safe_keyword = keyword_text.lower().replace(' ', '_').replace('/', '_')[:50]
            
            return {
                'id': f'keyword-{safe_keyword}',
                'type': 'keyword',
                'title': keyword_text,
                'summary': summary,
                'content': content,
                'url': f'/keywords?search={keyword.keyword}' if keyword.keyword else f'/keywords'
            }
        except Exception as e:
            logger.warning(f'Error creating keyword doc for ID {keyword.id}: {e}')
            return None

    def _index_batch(self, index, documents):
        """Index a batch of documents"""
        try:
            task = index.add_documents(documents, primary_key="id")
            self.stdout.write(f'  Indexed batch of {len(documents)} documents (task: {task.task_uid})')
        except MeilisearchError as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to index batch: {e}')
            )
