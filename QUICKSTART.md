# Quick Start Guide

Get the UEI (Unified Education Interface) platform running in minutes!

## 🚀 Quick Setup (5 minutes)

### Option 1: Using Python (Recommended for Development)

1. **Prerequisites**
   - Python 3.8 or higher
   - pip package manager

2. **Clone and Setup**
   ```bash
   # Clone repository
   git clone https://github.com/VaibhavUPratap/SIH.git
   cd SIH
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Configure Environment**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # .env will use SQLite by default - no database setup needed!
   # Just make sure to set a SECRET_KEY
   ```

4. **Initialize Database**
   ```bash
   python init_db.py
   ```

5. **Run the Application**
   ```bash
   python app.py
   ```

6. **Access the Application**
   - Open browser: http://localhost:5000
   - API Health Check: http://localhost:5000/health

### Option 2: Using Docker (Recommended for Production)

1. **Prerequisites**
   - Docker
   - Docker Compose

2. **Run with Docker**
   ```bash
   # Clone repository
   git clone https://github.com/VaibhavUPratap/SIH.git
   cd SIH/docker
   
   # Build and start
   docker-compose up -d
   
   # Check status
   docker-compose ps
   ```

3. **Access the Application**
   - Application: http://localhost
   - Direct API: http://localhost:5000

## 📝 First Steps

### 1. Register a User

Using cURL:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "username": "student1",
    "password": "password123",
    "full_name": "Test Student",
    "role": "student"
  }'
```

Using Python:
```python
import requests

response = requests.post('http://localhost:5000/api/auth/register', json={
    "email": "student@example.com",
    "username": "student1",
    "password": "password123",
    "full_name": "Test Student",
    "role": "student"
})

print(response.json())
```

### 2. Login and Get Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "password": "password123"
  }'
```

Save the `access_token` from the response for subsequent requests.

### 3. Create a Student Profile

```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "enrollment_number": "EN20231234",
    "program": "B.Tech",
    "specialization": "Computer Science",
    "enrollment_date": "2023-07-01",
    "year_of_study": 2,
    "semester": 4
  }'
```

### 4. View Dashboard

```bash
curl -X GET http://localhost:5000/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🎯 Sample Data

To populate the database with sample data for testing:

```bash
# Activate virtual environment first
source venv/bin/activate

# Run seed command
flask seed_db
```

This will create:
- 3 sample institutions
- 10 sample students
- 5 sample teachers
- 3 sample schemes

### Sample Credentials

After seeding, you can login with:

**Institutions:**
- Username: `inst1`, Password: `password123`
- Username: `inst2`, Password: `password123`

**Students:**
- Username: `student1` to `student10`, Password: `password123`

**Teachers:**
- Username: `teacher1` to `teacher5`, Password: `password123`

## 🔧 Common Tasks

### Check Application Health

```bash
curl http://localhost:5000/health
```

### List All Students (requires institution/ministry role)

```bash
curl -X GET http://localhost:5000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### List Available Schemes

```bash
curl -X GET http://localhost:5000/api/schemes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Apply for a Scheme (as student)

```bash
curl -X POST http://localhost:5000/api/schemes/1/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "requested_amount": 50000,
    "bank_account": "1234567890",
    "ifsc_code": "SBIN0001234"
  }'
```

## 📱 User Roles

### Student
- View personal profile
- Track academic performance
- Apply for schemes
- View eligible schemes

### Teacher
- Manage profile
- Submit APAR
- Add academic contributions
- View publications

### Institution
- Manage students and teachers
- Submit NIRF data
- Track compliance
- View analytics

### Ministry
- Access all data
- Create schemes
- View nationwide analytics
- Generate reports

## 🐛 Troubleshooting

### Port 5000 already in use

```bash
# Change port in app.py or use environment variable
export PORT=8000
python app.py
```

### Database errors

```bash
# Reset database
rm uei.db  # If using SQLite
python init_db.py
```

### Module not found errors

```bash
# Reinstall dependencies
pip install -r requirements.txt
```

### Permission errors

```bash
# Make sure directories exist with correct permissions
mkdir -p logs uploads
chmod 755 logs uploads
```

## 📚 Next Steps

1. **Read Full Documentation**
   - [API Documentation](docs/API.md)
   - [Deployment Guide](docs/DEPLOYMENT.md)

2. **Explore Features**
   - Try different API endpoints
   - Test role-based access
   - Explore analytics dashboard

3. **Customize**
   - Modify models for your needs
   - Add custom endpoints
   - Integrate with real APIs

4. **Deploy**
   - Follow deployment guide
   - Set up production database
   - Configure SSL/HTTPS

## 🆘 Getting Help

- **Issues**: https://github.com/VaibhavUPratap/SIH/issues
- **Documentation**: Check the `docs/` folder
- **API Reference**: See `docs/API.md`

## 🎉 You're All Set!

You now have a fully functional UEI platform running locally. Start exploring the APIs and building features!

**Happy Coding! 🚀**
