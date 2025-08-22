def clean_email(email):
    return email.strip().lower() if email else ''

def normalize_username(username):
    return username.strip() if username else ''