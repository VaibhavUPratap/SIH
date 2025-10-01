# Deployment Guide

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Security Considerations](#security-considerations)

## Local Development

### Prerequisites
- Python 3.8+
- PostgreSQL 12+ (or SQLite for quick start)
- pip and virtualenv

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/VaibhavUPratap/SIH.git
cd SIH
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

5. **Initialize database**
```bash
python init_db.py
```

6. **Seed sample data (optional)**
```bash
flask seed_db
```

7. **Run the application**
```bash
python app.py
# Or use Flask CLI
flask run
```

The application will be available at `http://localhost:5000`

## Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Build and Run

1. **Build the containers**
```bash
cd docker
docker-compose build
```

2. **Start the services**
```bash
docker-compose up -d
```

3. **Check status**
```bash
docker-compose ps
```

4. **View logs**
```bash
docker-compose logs -f web
```

5. **Stop the services**
```bash
docker-compose down
```

### Services
- **web** - Flask application (port 5000)
- **db** - PostgreSQL database (port 5432)
- **nginx** - Reverse proxy (port 80)

## Production Deployment

### Option 1: Cloud Deployment (AWS/GCP/Azure)

#### AWS Elastic Beanstalk

1. Install EB CLI
```bash
pip install awsebcli
```

2. Initialize EB application
```bash
eb init -p python-3.11 uei-platform
```

3. Create environment
```bash
eb create uei-prod-env
```

4. Deploy
```bash
eb deploy
```

#### GCP App Engine

1. Create `app.yaml`
```yaml
runtime: python311
entrypoint: gunicorn -b :$PORT app:create_app()

env_variables:
  DATABASE_URL: "postgresql://..."
  SECRET_KEY: "your-secret-key"
```

2. Deploy
```bash
gcloud app deploy
```

### Option 2: VPS Deployment (Ubuntu 22.04)

1. **Install dependencies**
```bash
sudo apt update
sudo apt install python3.11 python3-pip postgresql nginx
```

2. **Setup application**
```bash
cd /var/www
sudo git clone https://github.com/VaibhavUPratap/SIH.git uei
cd uei
sudo python3 -m venv venv
sudo venv/bin/pip install -r requirements.txt
```

3. **Configure PostgreSQL**
```bash
sudo -u postgres psql
CREATE DATABASE uei_db;
CREATE USER uei_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE uei_db TO uei_user;
\q
```

4. **Setup systemd service**
Create `/etc/systemd/system/uei.service`:
```ini
[Unit]
Description=UEI Platform
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/uei
Environment="PATH=/var/www/uei/venv/bin"
ExecStart=/var/www/uei/venv/bin/gunicorn --workers 4 --bind unix:uei.sock -m 007 app:create_app()

[Install]
WantedBy=multi-user.target
```

5. **Start service**
```bash
sudo systemctl start uei
sudo systemctl enable uei
```

6. **Configure Nginx**
Create `/etc/nginx/sites-available/uei`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/uei/uei.sock;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/uei /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

## Environment Configuration

### Essential Variables

```bash
# Flask
FLASK_ENV=production
SECRET_KEY=<generate-strong-key>
DEBUG=False

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT
JWT_SECRET_KEY=<generate-strong-key>
JWT_ACCESS_TOKEN_EXPIRES=3600

# Email (optional)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### Generate Secure Keys

```python
import secrets
print(secrets.token_urlsafe(32))
```

## Database Setup

### PostgreSQL Configuration

1. **Create database**
```sql
CREATE DATABASE uei_db;
CREATE USER uei_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE uei_db TO uei_user;
```

2. **Run migrations**
```bash
python init_db.py
```

3. **Backup database**
```bash
pg_dump -U uei_user uei_db > backup.sql
```

4. **Restore database**
```bash
psql -U uei_user uei_db < backup.sql
```

## Security Considerations

### 1. Environment Variables
- Never commit `.env` file to version control
- Use strong, randomly generated keys
- Rotate keys periodically

### 2. Database Security
- Use strong passwords
- Enable SSL connections
- Restrict network access
- Regular backups

### 3. Application Security
- Keep dependencies updated: `pip list --outdated`
- Enable HTTPS in production
- Implement rate limiting
- Use CORS properly

### 4. Monitoring
- Set up application logging
- Monitor error rates
- Track API usage
- Set up alerts

### 5. Firewall Configuration
```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Performance Optimization

### 1. Database Optimization
- Add indexes on frequently queried fields
- Use connection pooling
- Optimize queries with EXPLAIN

### 2. Caching
- Implement Redis for session storage
- Cache API responses
- Use CDN for static files

### 3. Load Balancing
- Use multiple application instances
- Implement health checks
- Use sticky sessions for stateful apps

## Maintenance

### Regular Tasks
- Update dependencies: `pip install -U -r requirements.txt`
- Database backups: Daily automated backups
- Log rotation: Configure logrotate
- SSL certificate renewal: Use certbot with Let's Encrypt

### Monitoring Commands
```bash
# Check application status
sudo systemctl status uei

# View logs
sudo journalctl -u uei -f

# Check database connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# Monitor disk space
df -h
```

## Troubleshooting

### Application won't start
1. Check logs: `sudo journalctl -u uei -n 50`
2. Verify database connection
3. Check file permissions
4. Verify environment variables

### Database connection errors
1. Check PostgreSQL status: `sudo systemctl status postgresql`
2. Verify credentials in `.env`
3. Check firewall rules
4. Test connection: `psql -U uei_user -d uei_db -h localhost`

### High memory usage
1. Reduce number of workers
2. Implement caching
3. Optimize database queries
4. Monitor with `htop`

## Scaling

### Horizontal Scaling
1. Add more application servers
2. Use load balancer (Nginx, HAProxy)
3. Shared database or read replicas
4. Shared file storage (S3, NFS)

### Vertical Scaling
1. Increase server resources (CPU, RAM)
2. Optimize database configuration
3. Use faster storage (SSD)

## Support

For deployment support:
- GitHub Issues: [Repository Issues](https://github.com/VaibhavUPratap/SIH/issues)
- Documentation: See README.md
