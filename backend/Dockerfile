# backend Dockerfile
FROM python:3.11-slim

# Setting the working directory
WORKDIR /app

# Installing system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    netcat-traditional \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libgdk-pixbuf-xlib-2.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    && rm -rf /var/lib/apt/lists/*

# Copying dependency files
COPY requirements.txt .

# Installing Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copying the project code
COPY . .

# Exposed port
EXPOSE 8000

# Create startup script (supports ASGI and WebSocket)
RUN echo '#!/bin/bash\n\
echo "Waiting for database..."\n\
while ! nc -z db 3306; do\n\
  sleep 1\n\
done\n\
echo "Database is ready!"\n\
\n\
echo "Waiting for Redis..."\n\
while ! nc -z redis 6379; do\n\
  sleep 1\n\
done\n\
echo "Redis is ready!"\n\
\n\
echo "Making migrations..."\n\
python manage.py makemigrations\n\
\n\
echo "Running migrations..."\n\
python manage.py migrate\n\
\n\
echo "Collecting static files..."\n\
python manage.py collectstatic --noinput\n\
\n\
echo "Starting ASGI server with WebSocket support..."\n\
daphne -b 0.0.0.0 -p 8000 sdg_backend.asgi:application' > /app/start.sh

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]