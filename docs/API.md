# API Documentation

## Overview

The Unified Education Interface (UEI) provides RESTful APIs for managing educational data across India's higher education ecosystem.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most API endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Common Response Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "full_name": "Full Name",
  "role": "student",
  "phone_number": "9876543210"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "username",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "username",
    "role": "student"
  }
}
```

#### Verify Aadhaar
```http
POST /api/auth/verify-aadhaar
Authorization: Bearer <token>
Content-Type: application/json

{
  "aadhaar_number": "123456789012",
  "otp": "123456"
}
```

#### Enable MFA
```http
POST /api/auth/mfa/enable
Authorization: Bearer <token>
```

### Students

#### List Students
```http
GET /api/students?page=1&per_page=20
Authorization: Bearer <token>
```

#### Get Student Details
```http
GET /api/students/{student_id}
Authorization: Bearer <token>
```

#### Create Student Profile
```http
POST /api/students
Authorization: Bearer <token>
Content-Type: application/json

{
  "enrollment_number": "EN20231234",
  "program": "B.Tech",
  "specialization": "Computer Science",
  "enrollment_date": "2023-07-01",
  "institution_id": 1
}
```

#### Get Student Performance
```http
GET /api/students/{student_id}/performance
Authorization: Bearer <token>
```

#### Get Eligible Schemes
```http
GET /api/students/{student_id}/schemes
Authorization: Bearer <token>
```

### Teachers

#### List Teachers
```http
GET /api/teachers?page=1&per_page=20
Authorization: Bearer <token>
```

#### Get Teacher Details
```http
GET /api/teachers/{teacher_id}
Authorization: Bearer <token>
```

#### Submit APAR
```http
POST /api/teachers/{teacher_id}/apar
Authorization: Bearer <token>
Content-Type: application/json

{
  "year": 2023,
  "assessment_period": "2023-2024",
  "teaching_score": 85.5,
  "research_score": 90.0,
  "overall_score": 87.5
}
```

#### Get Academic Contributions
```http
GET /api/teachers/{teacher_id}/contributions
Authorization: Bearer <token>
```

### Institutions

#### List Institutions
```http
GET /api/institutions?page=1&per_page=20
Authorization: Bearer <token>
```

#### Get Institution Details
```http
GET /api/institutions/{institution_id}
Authorization: Bearer <token>
```

#### Get NIRF Data
```http
GET /api/institutions/{institution_id}/nirf
Authorization: Bearer <token>
```

#### Get Compliance Records
```http
GET /api/institutions/{institution_id}/compliance
Authorization: Bearer <token>
```

### Schemes

#### List Schemes
```http
GET /api/schemes?is_active=true&target_group=student
Authorization: Bearer <token>
```

#### Get Scheme Details
```http
GET /api/schemes/{scheme_id}
Authorization: Bearer <token>
```

#### Apply for Scheme
```http
POST /api/schemes/{scheme_id}/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "requested_amount": 50000,
  "bank_account": "1234567890",
  "ifsc_code": "ABCD0123456"
}
```

#### Get Beneficiaries
```http
GET /api/schemes/{scheme_id}/beneficiaries
Authorization: Bearer <token>
```

### Analytics

#### Get Dashboard
```http
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

Response varies by user role:
- Student: Academic performance, scheme applications
- Teacher: Publications, citations, APAR status
- Institution: Student/faculty count, NIRF data
- Ministry: Aggregated statistics

#### Get Trends
```http
GET /api/analytics/trends?metric=enrollment
Authorization: Bearer <token>
```

#### Generate Report
```http
GET /api/analytics/reports/{report_type}
Authorization: Bearer <token>
```

Report types: `students`, `institutions`, `schemes`

## Role-Based Access Control

### Roles
- `student` - Access to own profile, performance, schemes
- `teacher` - Access to own profile, APAR, contributions
- `institution` - Access to students, teachers, compliance
- `ministry` - Full access to all data and analytics

### Permission Matrix

| Endpoint | Student | Teacher | Institution | Ministry |
|----------|---------|---------|-------------|----------|
| Own Profile | ✓ | ✓ | ✓ | ✓ |
| List Students | ✗ | ✗ | ✓ | ✓ |
| Submit APAR | ✗ | ✓ | ✗ | ✓ |
| Create Scheme | ✗ | ✗ | ✗ | ✓ |
| Analytics Dashboard | ✓ | ✓ | ✓ | ✓ |

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

For validation errors:

```json
{
  "error": "Missing required fields",
  "missing_fields": ["field1", "field2"]
}
```

## Rate Limiting

Default rate limit: 100 requests per hour per user.

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Pagination

List endpoints support pagination:

Query parameters:
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 20, max: 100)

Response:
```json
{
  "items": [...],
  "total": 150,
  "pages": 8,
  "current_page": 1
}
```

## Filtering

Some endpoints support filtering via query parameters:

```http
GET /api/schemes?is_active=true&target_group=student
GET /api/students?institution_id=1&year_of_study=2
```

## Support

For API support, please open an issue on GitHub.
