# UEI Quick Reference Guide

## 🚀 Quick Start (3 Steps)

### 1. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run seed-admin  # Creates admin account
npm start           # Starts on port 5000
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm start           # Starts on port 3000
```

### 3. Access the System
- **Homepage:** http://localhost:3000
- **API:** http://localhost:5000
- **Admin Login:** admin@uei.gov.in / admin123

---

## 📚 Quick Links

| Resource | Link |
|----------|------|
| **Setup Guide** | [docs/SETUP_GUIDE.md](SETUP_GUIDE.md) |
| **API Docs** | [docs/API_DOCUMENTATION.md](API_DOCUMENTATION.md) |
| **Architecture** | [docs/ARCHITECTURE.md](ARCHITECTURE.md) |
| **Features** | [docs/FEATURES.md](FEATURES.md) |
| **Database Schema** | [docs/DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) |

---

## 🔑 Default Credentials

### Admin Account
```
Email:    admin@uei.gov.in
Password: admin123
⚠️ Change password after first login!
```

### Test Users (Create via Register page)
- **Student:** Any valid email + 12-digit Aadhaar
- **Teacher:** Any valid email + APAR code + 12-digit Aadhaar
- **Institution:** Any valid email + AISHE code

---

## 🎯 Key API Endpoints

### Authentication
```
POST /api/auth/register/student       - Register student
POST /api/auth/register/teacher       - Register teacher
POST /api/auth/register/institution   - Register institution
POST /api/auth/login                  - Login (all roles)
POST /api/auth/verify-aadhaar         - Verify Aadhaar
```

### Student (Protected)
```
GET  /api/student/dashboard           - Get dashboard data
GET  /api/student/schemes             - Get available schemes
POST /api/student/apply-scheme        - Apply for scheme
```

### Teacher (Protected)
```
GET  /api/teacher/dashboard           - Get dashboard data
GET  /api/teacher/students            - Get students by class
POST /api/teacher/update-performance  - Update student marks
POST /api/teacher/mark-attendance     - Mark attendance
```

### Institution (Protected)
```
GET  /api/institution/dashboard       - Get dashboard data
GET  /api/institution/students        - Get all students
GET  /api/institution/teachers        - Get all teachers
POST /api/institution/update-compliance - Update compliance
```

### Admin (Protected)
```
GET  /api/admin/dashboard             - Get system overview
GET  /api/admin/institutions          - List institutions
GET  /api/admin/students              - List students
GET  /api/admin/teachers              - List teachers
POST /api/admin/schemes               - Create scheme
GET  /api/admin/schemes               - List schemes
GET  /api/admin/reports               - Generate reports
```

---

## 🔐 Authentication Flow

```
1. User registers → Password hashed → Account created
2. User logs in → Credentials verified → JWT token issued
3. Token stored in localStorage
4. Token sent with each request → Middleware validates → Access granted
```

---

## 🗄️ Database Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| **students** | Student records | aadhaarNumber, email, performance |
| **teachers** | Teacher records | aparCode, aadhaarNumber, classes |
| **institutions** | Institution records | aisheCode, compliance, statistics |
| **schemes** | Educational schemes | name, eligibility, applicants |
| **admins** | System administrators | email, permissions |

---

## 📊 Role Permissions

| Feature | Student | Teacher | Institution | Admin |
|---------|---------|---------|-------------|-------|
| View own data | ✅ | ✅ | ✅ | ✅ |
| Apply for schemes | ✅ | ✅ | ✅ | ❌ |
| Update performance | ❌ | ✅ | ❌ | ❌ |
| Mark attendance | ❌ | ✅ | ❌ | ❌ |
| View all students | ❌ | Class-wise | Institution | All |
| Create schemes | ❌ | ❌ | ❌ | ✅ |
| Generate reports | ❌ | ❌ | Limited | Full |
| Manage users | ❌ | ❌ | Limited | Full |

---

## 🛠️ Common Commands

### Backend
```bash
npm start              # Start server
npm run dev            # Start with nodemon
npm run seed-admin     # Create admin user
node -c filename.js    # Check syntax
```

### Frontend
```bash
npm start              # Development server
npm run build          # Production build
npm test               # Run tests
```

### MongoDB
```bash
mongod                 # Start MongoDB
mongo                  # MongoDB shell
mongod --dbpath <path> # Custom data directory
```

---

## 🐛 Quick Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
sudo systemctl start mongod  # Linux
net start MongoDB            # Windows
```

### Port Already in Use
```bash
# Change backend port in .env
PORT=5001

# Change frontend port
PORT=3001 npm start
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors
- Ensure backend is on port 5000
- Ensure frontend is on port 3000
- Clear browser cache

---

## 📦 Project Structure

```
SIH/
├── backend/
│   ├── config/          # Database config
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth & validation
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   ├── server.js        # Main server file
│   └── seedAdmin.js     # Admin seeding
│
├── frontend/
│   ├── public/          # Static files
│   └── src/
│       ├── pages/       # Dashboard pages
│       ├── utils/       # API client
│       ├── App.js       # Main app
│       └── App.css      # Styles
│
└── docs/                # Documentation
```

---

## 🔄 Development Workflow

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Start Backend** (Terminal 1)
   ```bash
   cd backend
   npm start
   ```

3. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm start
   ```

4. **Access Application**
   - Open http://localhost:3000
   - Login or register
   - Test features

---

## 📝 Testing Checklist

### Student Flow
- [ ] Register student account
- [ ] Login with student credentials
- [ ] View dashboard
- [ ] Check performance data
- [ ] Apply for a scheme
- [ ] View scheme status

### Teacher Flow
- [ ] Register teacher account
- [ ] Login with teacher credentials
- [ ] View assigned classes
- [ ] Update student performance
- [ ] Mark attendance

### Institution Flow
- [ ] Register institution
- [ ] Login with institution credentials
- [ ] View statistics
- [ ] Update compliance

### Admin Flow
- [ ] Login with admin credentials
- [ ] View system overview
- [ ] Create a new scheme
- [ ] Generate reports
- [ ] Approve scheme applications

---

## 📞 Support

### Documentation
- 📖 [README.md](../README.md)
- 🏗️ [ARCHITECTURE.md](ARCHITECTURE.md)
- ⚙️ [SETUP_GUIDE.md](SETUP_GUIDE.md)

### Help
- 📧 Email: support@uei.edu.in
- 🌐 Website: https://uei.edu.in

---

## 🎓 Key Features Summary

✅ **Verification:** Aadhaar, APAR, AISHE code integration  
✅ **Security:** JWT auth, password hashing, role-based access  
✅ **Dashboards:** Customized for each user role  
✅ **Analytics:** Performance tracking and reporting  
✅ **Schemes:** Application and management system  
✅ **Compliance:** Monitoring and tracking  
✅ **Reports:** Comprehensive analytics and insights  

---

**Version:** 1.0  
**Last Updated:** January 2024  
**Status:** Production Ready ✅
