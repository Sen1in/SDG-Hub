class DatabaseRouter:
    """
    Database router, used for processing existing database tables
    """
    def db_for_read(self, model, **hints):
        return 'default'

    def db_for_write(self, model, **hints):
        return 'default'

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        # For the existing tables, Django is not allowed to perform migrations.
        if app_label in ['actions', 'education', 'keywords']:
            return False
        return True