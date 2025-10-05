# 🎯 EduVerify Dashboard Testing Guide

This document provides complete instructions for testing all dashboard types with pre-configured test accounts.

## 🚀 Quick Start

### 1. Setup Test Accounts
Run the test account creation script:
```bash
python create_test_accounts.py
```

### 2. Access Test Center
Open your browser and navigate to:
```
http://localhost:5000/test
```

## 👥 Test Accounts

### 📚 Student Account
- **Email**: `student.test@edu.in`
- **Password**: `student123`
- **Role**: Student
- **Dashboard**: `/student/dashboard`
- **Features**: Academic progress, document verification, scholarship applications

### 👨‍🏫 Teacher Account  
- **Email**: `teacher.test@edu.in`
- **Password**: `teacher123`
- **Role**: Teacher
- **Dashboard**: `/teacher/dashboard`
- **Features**: Student management, evaluations, performance analytics

### 🏛️ Institution Account
- **Email**: `institution.test@edu.in`
- **Password**: `institution123`
- **Role**: Institution
- **Dashboard**: `/institution/dashboard`
- **Features**: Student/faculty management, compliance tracking, scheme management

### ⚙️ Admin Account
- **Email**: `admin.test@edu.in`
- **Password**: `admin123`
- **Role**: Admin
- **Dashboard**: `/admin/dashboard`
- **Features**: System oversight, user verification, scheme management

## 🔧 Testing Workflow

### Method 1: Quick Login (Recommended)
1. Visit `http://localhost:5000/test`
2. Click "Quick Login" for any role
3. System automatically logs you in and opens the dashboard
4. Test dashboard features and functionality

### Method 2: Manual Login
1. Use the manual login form on the test page
2. Enter credentials manually
3. Check token status
4. Navigate to appropriate dashboard

### Method 3: Direct Dashboard Access
1. Login with any method above
2. Visit dashboard URLs directly:
   - Student: `http://localhost:5000/student/dashboard`
   - Teacher: `http://localhost:5000/teacher/dashboard`
   - Institution: `http://localhost:5000/institution/dashboard`
   - Admin: `http://localhost:5000/admin/dashboard`

## 🧪 API Testing

The test page includes API testing tools:

### Profile API Test
- Tests `/auth/profile` endpoint
- Displays user profile data
- Validates JWT authentication

### Performance API Test
- Tests `/student/performance` endpoint
- Shows academic performance data
- Validates role-based access

## 📱 Dashboard Features to Test

### Student Dashboard
- ✅ Profile management & editing
- ✅ Document upload & verification
- ✅ Academic progress visualization
- ✅ Scholarship application tracking
- ✅ Quick actions & navigation

### Teacher Dashboard
- ✅ Student list management
- ✅ Evaluation system with modals
- ✅ Performance charts & analytics
- ✅ Bulk operations
- ✅ APAR status tracking

### Institution Dashboard
- ✅ Multi-metric overview (8 key stats)
- ✅ Student & faculty management
- ✅ Government schemes tracking
- ✅ Compliance monitoring
- ✅ Advanced analytics charts

### Admin Dashboard
- ✅ System-wide analytics
- ✅ User verification queue
- ✅ Scheme oversight
- ✅ Verification trends

## 🔍 Testing Checklist

### Authentication Testing
- [ ] Quick login for each role works
- [ ] Token generation and storage
- [ ] Role-based dashboard access
- [ ] Logout functionality

### UI/UX Testing
- [ ] Responsive design on different screen sizes
- [ ] Interactive elements (buttons, modals, forms)
- [ ] Chart rendering and interactivity
- [ ] Loading states and error handling

### API Integration Testing
- [ ] Profile data loading
- [ ] Dashboard-specific API calls
- [ ] Error handling for failed requests
- [ ] JWT token validation

### Cross-Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Edge

## 🛠️ Troubleshooting

### Common Issues

#### 1. Login Fails
- Check if Flask app is running on port 5000
- Verify test accounts exist (re-run creation script)
- Check browser console for errors

#### 2. Dashboard Not Loading
- Ensure you're logged in (check token status)
- Verify correct role access
- Check browser console for JavaScript errors

#### 3. API Calls Failing
- Check if backend routes are properly registered
- Verify JWT token is valid
- Ensure database connection is working

#### 4. Charts Not Rendering
- Check if Chart.js is loaded properly
- Verify canvas elements exist in DOM
- Look for JavaScript console errors

### Debug Commands

```bash
# Check if Flask app is running
curl http://localhost:5000/test

# Test login API directly
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student.test@edu.in","password":"student123"}'

# Test profile API with token
curl http://localhost:5000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📊 Expected Test Results

### Successful Test Indicators
- ✅ All quick login buttons work
- ✅ Token status shows "Authenticated"
- ✅ Dashboards load without errors
- ✅ Charts render properly
- ✅ Interactive elements respond
- ✅ API calls return valid data
- ✅ Role-based access control works

### Performance Benchmarks
- Dashboard load time: < 2 seconds
- API response time: < 500ms
- Chart rendering: < 1 second
- Page navigation: Instant

## 🚀 Advanced Testing

### Load Testing
Test with multiple concurrent users:
```bash
# Install siege for load testing
# Example load test (adjust URL and credentials)
siege -c 10 -t 30s http://localhost:5000/test
```

### API Testing with Postman
Import the following endpoints for comprehensive API testing:
- POST `/auth/login`
- GET `/auth/profile`
- GET `/student/performance`
- GET `/teacher/performance`
- GET `/institution/analytics`
- GET `/admin/analytics`

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review browser console errors
3. Verify Flask app logs
4. Ensure database is properly initialized

## 🎉 Success Criteria

Your dashboard system is working correctly if:
- ✅ All 4 test accounts can login successfully
- ✅ Each dashboard loads and displays properly
- ✅ Charts and interactive elements work
- ✅ API calls succeed and return data
- ✅ Navigation between sections works
- ✅ Responsive design works on mobile/desktop
- ✅ No console errors or broken functionality

---

**Happy Testing! 🎯**

For additional support or questions about the dashboard implementation, refer to the main project documentation or contact the development team.