# UEI API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Routes

### Register Student
**POST** `/auth/register/student`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "aadhaarNumber": "123456789012",
  "dateOfBirth": "2000-01-01",
  "gender": "Male",
  "phoneNumber": "9876543210"
}
```

**Response:**
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Register Teacher
**POST** `/auth/register/teacher`

**Body:**
```json
{
  "name": "Jane Teacher",
  "email": "jane@example.com",
  "password": "password123",
  "aparCode": "APAR123456",
  "aadhaarNumber": "123456789012",
  "dateOfBirth": "1985-05-15",
  "gender": "Female",
  "phoneNumber": "9876543210"
}
```

### Register Institution
**POST** `/auth/register/institution`

**Body:**
```json
{
  "name": "ABC University",
  "email": "abc@university.com",
  "password": "password123",
  "aisheCode": "U-12345",
  "type": "University",
  "phoneNumber": "0123456789"
}
```

### Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

**Response:**
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Verify Aadhaar
**POST** `/auth/verify-aadhaar`

**Body:**
```json
{
  "aadhaarNumber": "123456789012",
  "userId": "user_id",
  "userType": "student"
}
```

### Get Profile
**GET** `/auth/profile`

**Headers:** `Authorization: Bearer <token>`

---

## Student Routes

### Get Dashboard
**GET** `/student/dashboard`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "profile": {
    "name": "John Doe",
    "email": "john@example.com",
    "class": "10",
    "section": "A",
    "isVerified": true
  },
  "analytics": {
    "attendancePercentage": 85.5,
    "averageMarks": 78.5,
    "totalSubjects": 6,
    "appliedSchemes": 2,
    "approvedSchemes": 1
  },
  "recentPerformance": [...],
  "recentAttendance": [...],
  "schemes": [...]
}
```

### Get Performance
**GET** `/student/performance`

### Apply for Scheme
**POST** `/student/apply-scheme`

**Body:**
```json
{
  "schemeId": "scheme_id"
}
```

### Get Available Schemes
**GET** `/student/schemes`

---

## Teacher Routes

### Get Dashboard
**GET** `/teacher/dashboard`

**Headers:** `Authorization: Bearer <token>`

### Get Students by Class
**GET** `/teacher/students?classId=10&section=A`

### Update Student Performance
**POST** `/teacher/update-performance`

**Body:**
```json
{
  "studentId": "student_id",
  "subject": "Mathematics",
  "marks": 85,
  "grade": "A",
  "semester": "1",
  "year": "2024"
}
```

### Mark Attendance
**POST** `/teacher/mark-attendance`

**Body:**
```json
{
  "studentId": "student_id",
  "date": "2024-01-01",
  "status": "Present"
}
```

---

## Institution Routes

### Get Dashboard
**GET** `/institution/dashboard`

**Headers:** `Authorization: Bearer <token>`

### Get Students
**GET** `/institution/students`

### Get Teachers
**GET** `/institution/teachers`

### Update Performance
**POST** `/institution/update-performance`

**Body:**
```json
{
  "academicYear": "2023-24",
  "passPercentage": 92.5,
  "averageGrade": "B+",
  "ranking": 15,
  "achievements": ["Best College Award", "Sports Achievement"]
}
```

### Update Compliance
**POST** `/institution/update-compliance`

**Body:**
```json
{
  "requirement": "Fire Safety",
  "status": "Compliant",
  "remarks": "All safety measures in place"
}
```

---

## Admin Routes

### Get Dashboard
**GET** `/admin/dashboard`

**Headers:** `Authorization: Bearer <token>`

### Get All Institutions
**GET** `/admin/institutions?page=1&limit=20`

### Get All Students
**GET** `/admin/students?page=1&limit=20`

### Get All Teachers
**GET** `/admin/teachers?page=1&limit=20`

### Create Scheme
**POST** `/admin/schemes`

**Body:**
```json
{
  "name": "Merit Scholarship 2024",
  "description": "Scholarship for meritorious students",
  "category": "Scholarship",
  "eligibility": {
    "minAge": 16,
    "maxAge": 25,
    "minIncome": 0,
    "maxIncome": 500000
  },
  "benefits": {
    "amount": 50000,
    "frequency": "Annually",
    "duration": "1 year"
  },
  "startDate": "2024-01-01",
  "applicationDeadline": "2024-03-31",
  "isActive": true
}
```

### Get All Schemes
**GET** `/admin/schemes`

### Update Scheme
**PUT** `/admin/schemes/:id`

### Update Scheme Application
**POST** `/admin/schemes/applications`

**Body:**
```json
{
  "schemeId": "scheme_id",
  "applicantId": "applicant_id",
  "status": "Approved",
  "remarks": "Application approved"
}
```

### Generate Report
**GET** `/admin/reports?reportType=enrollment&startDate=2024-01-01&endDate=2024-12-31`

**Report Types:**
- `enrollment` - Enrollment statistics
- `performance` - Performance analytics
- `schemes` - Scheme utilization
- `compliance` - Compliance status

---

## Error Responses

All error responses follow this format:
```json
{
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
