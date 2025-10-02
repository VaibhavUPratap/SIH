# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Unified Education Interface (UEI)** - A centralized platform for Smart India Hackathon 2025 (Problem Code: SIH25252) that integrates and analyzes data from students, teachers, and higher education institutions. The system provides secure, Aadhaar/APAR/AISHE-verified authentication with role-based dashboards and AI-driven analytics.

## Development Commands

### Environment Setup
```powershell
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Database Operations
```powershell
# Initialize database migrations (first time only)
flask db init

# Create migration after model changes
flask db migrate -m "Description of changes"

# Apply migrations
flask db upgrade

# Downgrade migrations (if needed)
flask db downgrade
```

### Development Server
```powershell
# Run development server
python app.py

# Run with specific environment
$env:FLASK_ENV="development"; python app.py

# Alternative Flask run command
flask run --host=127.0.0.1 --port=5000
```

### Testing
```powershell
# Test API routes
python test_routes.py

# Test with specific endpoints (manual testing via curl/requests)
# Registration: POST /auth/register
# Login: POST /auth/login
# Protected routes require Authorization: Bearer <token> header
```

### Database Reset (Development)
```powershell
# Reset SQLite database (development only)
Remove-Item unified_education.db -ErrorAction SilentlyContinue
flask db upgrade
```

## Tech Stack

### Backend
- **Python**: Core programming language
- **Flask**: Web framework with application factory pattern
- **Flask-SQLAlchemy**: ORM for database operations
- **Flask-Migrate**: Database migration management
- **Flask-JWT-Extended**: JWT authentication and authorization
- **Werkzeug**: Password hashing and security utilities
- **python-dotenv**: Environment variable management
- **psycopg2-binary**: PostgreSQL adapter (production)

### Frontend
- **HTML5**: Semantic markup structure
- **TailwindCSS**: Utility-first CSS framework via CDN
- **Vanilla JavaScript**: Client-side interactivity and API calls
- **Jinja2**: Server-side template engine

### Database
- **SQLite**: Development database (unified_education.db)
- **PostgreSQL**: Production database (scalable, ACID compliant)
- **JSON Fields**: Flexible data storage for courses, projects, evaluations

### Authentication & Security
- **JWT Tokens**: Stateless authentication with 24-hour expiration
- **Role-based Access Control**: Four user roles (student, teacher, institution, admin)
- **Mock Verification Services**: Aadhaar, APAR ID, AISHE code verification
- **Password Hashing**: Werkzeug secure password storage

### Deployment Structure
- **Modular Blueprint Architecture**: Scalable route organization
- **Environment Configuration**: Development/Production config classes
- **Migration Support**: Alembic database versioning
- **Service Layer**: Analytics, Reports, Verification services

## Architecture Overview

### Core Application Structure
- **Flask Application Factory Pattern**: `app.py` uses `create_app()` for configuration flexibility
- **Blueprint-based Routing**: Routes organized by role/functionality in `routes/` directory
- **SQLAlchemy ORM**: Database models in `models/` with relationships and cascade deletes
- **JWT Authentication**: Role-based access control with user identity management
- **Template-based Frontend**: Jinja2 templates with TailwindCSS styling
- **Service Layer Architecture**: Separated business logic in `services/` directory

### Database Schema
- **users**: Base user table with polymorphic role relationships
- **students**: Extended profile with enrollment_no, courses (JSON), projects (JSON), academic_progress
- **teachers**: Extended profile with apar_id, subject, evaluations (JSON), department
- **institutions**: Extended profile with aishe_code, institution_name, schemes (JSON), nirf_rank, established_year

### Complete Project Structure
```
D:\Projects\SIH\
├── app.py                          # Main Flask application
├── config.py                       # Configuration classes
├── requirements.txt                # Python dependencies
├── WARP.md                        # This file
├── README.md                      # Project documentation
├── test_routes.py                 # API testing script
├── migrations/                    # Database migrations
│   ├── env.py                    # Alembic environment
│   └── versions/                 # Migration versions
├── models/                        # Database models
│   ├── user.py                   # Base user model + DB instance
│   ├── student.py                # Student profile model
│   ├── teacher.py                # Teacher profile model
│   └── institution.py            # Institution profile model
├── routes/                        # Blueprint route handlers
│   ├── auth_routes.py            # Authentication endpoints
│   ├── student_routes.py         # Student-specific endpoints
│   ├── teacher_routes.py         # Teacher-specific endpoints
│   ├── institution_routes.py     # Institution-specific endpoints
│   └── admin_routes.py           # Admin-specific endpoints
├── services/                      # Business logic services
│   ├── analytics_service.py      # System analytics and reporting
│   ├── report_service.py         # Report generation
│   └── verification_service.py   # Identity verification (mock)
├── templates/                     # Jinja2 HTML templates
│   ├── base.html                 # Base template with navigation
│   ├── login.html                # Login/Registration page
│   ├── dashboard_student.html    # Student dashboard
│   ├── dashboard_teacher.html    # Teacher dashboard
│   ├── dashboard_institution.html # Institution dashboard
│   └── dashboard_admin.html      # Admin dashboard
├── static/                        # Static assets
│   ├── css/
│   │   └── style.css             # Custom CSS styles
│   └── js/
│       ├── auth.js               # Authentication handling
│       └── main.js               # Common utilities and functions
└── utils/                         # Utility functions
    ├── helpers.py                # Role decorators, JSON helpers
    ├── security.py               # Security utilities
    └── db.py                     # Database utilities
```

### Functional Requirements

#### 1. Authentication Module (`/auth/*`)
- **POST /auth/register**: Register users (student, teacher, institution, admin) with role-specific data
- **POST /auth/login**: Authenticate users and return JWT tokens
- **GET /auth/profile**: Retrieve user profile information (protected)

#### 2. Student Module (`/student/*`)
- **GET /student/dashboard**: Student dashboard view with academic progress
- **POST /student/upload_project**: Upload project details with technology and GitHub links
- **GET /student/performance**: View academic progress and performance analytics

#### 3. Teacher Module (`/teacher/*`)
- **GET /teacher/dashboard**: Teacher dashboard with evaluation statistics
- **POST /teacher/evaluate_student**: Evaluate student projects and update progress
- **GET /teacher/performance**: View teacher performance metrics and evaluation count

#### 4. Institution Module (`/institution/*`)
- **GET /institution/dashboard**: Institution dashboard with NIRF ranking and analytics
- **POST /institution/upload_data**: Upload NIRF metrics and scheme information
- **GET /institution/analytics**: Performance report with student/teacher counts

#### 5. Admin Module (`/admin/*`)
- **GET /admin/dashboard**: View system-wide statistics and user management
- **POST /admin/manage_users**: Add/remove/update user roles and permissions
- **GET /admin/reports**: Generate comprehensive system analytics
- **GET /admin/analytics**: Detailed admin reports with trends and insights

### Key Components

#### Authentication Flow
1. **Registration**: Creates User + role-specific profile (Student/Teacher/Institution)
2. **JWT Token Generation**: Uses user.id as identity, not full user object
3. **Role-based Authorization**: `@role_required(['role'])` decorator in `utils/helpers.py`
4. **Multi-factor Verification**: Aadhaar (students), APAR ID (teachers), AISHE code (institutions)
5. **Mock Verification Services**: Complete verification workflow with OTP generation

#### Role-based Dashboards
- **Student Dashboard**: Academic progress bars, project upload modals, performance tracking
- **Teacher Dashboard**: Student evaluation forms, evaluation statistics, performance metrics
- **Institution Dashboard**: NIRF ranking display, data upload forms, comprehensive analytics
- **Admin Dashboard**: System-wide statistics, user management interface, detailed reports

#### Service Layer Architecture
- **AnalyticsService**: System overview, student performance trends, institution rankings, teacher stats
- **ReportService**: Generate role-specific reports (admin, institution, student, teacher)
- **VerificationService**: Mock Aadhaar, APAR, AISHE verification with OTP support

#### Data Storage Patterns
- **JSON-in-Text Fields**: Complex data (courses, projects, evaluations) stored as JSON strings
- **Helper Functions**: `json_to_text()` and `text_to_json()` in `utils/helpers.py`
- **Cascade Relationships**: User deletion automatically removes associated profiles
- **Flexible Schema**: JSON fields allow evolving data structures without migrations

### Database Models

#### User Model (Base)
- **id**: UUID primary key
- **name**: Full name (required)
- **email**: Unique email address (required)
- **password_hash**: Werkzeug hashed password
- **role**: Enum (student, teacher, institution, admin)
- **aadhaar_id**: 12-digit Aadhaar number (unique)
- **created_at/updated_at**: Timestamps

#### Student Model (Extended)
- **id**: UUID (same as user_id)
- **user_id**: Foreign key to users table
- **enrollment_no**: Unique enrollment number (required)
- **courses**: JSON text field (course list)
- **projects**: JSON text field (project details)
- **academic_progress**: Float (0.0-100.0)

#### Teacher Model (Extended)
- **id**: UUID (same as user_id)
- **user_id**: Foreign key to users table
- **apar_id**: Unique APAR identifier (required)
- **subject**: Teaching subject
- **evaluations**: JSON text field (student evaluations)
- **department**: Department name

#### Institution Model (Extended)
- **id**: UUID (same as user_id)
- **user_id**: Foreign key to users table
- **aishe_code**: Unique AISHE identifier (required)
- **institution_name**: Institution name
- **nirf_rank**: Integer (NIRF ranking)
- **schemes**: JSON text field (government schemes)
- **address**: Text field
- **established_year**: Integer

### Frontend Templates

#### login.html
- Combined login/registration form with role-specific fields
- Dynamic field visibility based on selected role
- Client-side form validation
- JWT token storage in localStorage

#### dashboard_student.html
- Academic progress visualization with progress bars
- Project upload modal with GitHub integration
- Project listing with technology tags
- Performance analytics section

#### dashboard_teacher.html
- Teacher profile information display
- Student evaluation modal with score input
- Evaluation statistics and history
- Performance metrics dashboard

#### dashboard_institution.html
- Institution profile with NIRF ranking
- Data upload forms for metrics and schemes
- Analytics dashboard with student/teacher counts
- Visual statistics with color-coded cards

#### dashboard_admin.html
- System-wide statistics cards
- User management interface with search
- Report generation buttons
- Comprehensive analytics display

### Route Organization
- `/auth/*` - Authentication and profile management
- `/student/*` - Student-specific operations (projects, performance)
- `/teacher/*` - Teacher-specific operations (evaluations, student tracking)
- `/institution/*` - Institution-specific operations (compliance, rankings)
- `/admin/*` - Administrative operations (user management, system reports)

## Key Development Patterns

### JWT Implementation
- User identity stored as `user.id` string, not user object
- `current_user` available in JWT-protected routes via Flask-JWT-Extended
- Token expiration set to 24 hours in `config.py`

### Role-based Security
- All protected routes use `@jwt_required()` + `@role_required(['role1', 'role2'])`
- Role validation happens at route level, not template level
- Database constraints ensure data integrity across role profiles

### Frontend-Backend Communication
- Templates use JavaScript for dynamic API calls with Bearer token authentication
- LocalStorage manages token persistence
- All API responses follow consistent JSON format with error handling

### Database Migration Strategy
- Flask-Migrate handles schema changes
- Foreign key relationships with CASCADE options for data consistency
- JSON fields used for flexible, evolving data structures (courses, projects, etc.)

### Error Handling
- Consistent error response format: `{'error': 'message'}`
- Database rollback on transaction failures
- 404/500 error handlers return JSON responses

## Configuration Notes

### Environment Variables
- `SECRET_KEY`: Flask session security
- `JWT_SECRET_KEY`: JWT token signing
- `DATABASE_URL`: Database connection (SQLite default, PostgreSQL for production)
- `FLASK_ENV`: Environment selection (development/production)

### Database Support
- **Development**: SQLite (`unified_education.db`)
- **Production**: PostgreSQL (configured via `DATABASE_URL`)
- **Future**: MongoDB integration planned for unstructured data

### Security Features
- Password hashing via Werkzeug
- JWT token-based authentication with 24-hour expiration
- Role-based access control (RBAC) with decorator enforcement
- Mock Aadhaar/APAR/AISHE verification services
- Client-side token management with automatic expiration handling
- HTTPS enforcement in production
- Input validation and sanitization
- CSRF protection via SameSite cookies

## Complete Deliverables

### Backend Implementation
- **✅ Flask Application**: Complete app.py with factory pattern and error handling
- **✅ Modular Blueprints**: All 5 route modules (auth, student, teacher, institution, admin)
- **✅ SQLAlchemy Models**: User, Student, Teacher, Institution with relationships
- **✅ JWT Authentication**: Complete token-based auth with role decorators
- **✅ Database Migrations**: Flask-Migrate setup with Alembic support
- **✅ Service Layer**: Analytics, Report, and Verification services
- **✅ Configuration**: Development/Production config classes with environment variables

### Frontend Implementation
- **✅ Responsive Templates**: All 5 HTML templates with TailwindCSS
- **✅ Interactive Forms**: Login/registration with role-specific fields
- **✅ Dashboard Functionality**: Role-based dashboards with modals and charts
- **✅ JavaScript Integration**: Authentication handling and API calls
- **✅ Real-time Updates**: Dynamic content loading and form submissions
- **✅ Mobile-Responsive**: Tailwind grid system for all screen sizes

### API Endpoints (Complete)
- **Authentication**: Register, Login, Profile (3 endpoints)
- **Student Operations**: Dashboard, Upload Project, Performance (3 endpoints)
- **Teacher Operations**: Dashboard, Evaluate Student, Performance (3 endpoints)
- **Institution Operations**: Dashboard, Upload Data, Analytics (3 endpoints)
- **Admin Operations**: Dashboard, Manage Users, Reports, Analytics (4 endpoints)
- **Total**: 16 fully functional API endpoints

### Database Features
- **✅ Multi-role User System**: Polymorphic relationships with cascade deletes
- **✅ JSON Data Storage**: Flexible schema for projects, courses, evaluations
- **✅ Migration Support**: Automatic schema versioning and updates
- **✅ Data Integrity**: Foreign key constraints and validation
- **✅ Scalable Design**: SQLite for development, PostgreSQL for production

### Testing & Documentation
- **✅ API Testing**: test_routes.py for endpoint validation
- **✅ Development Documentation**: Complete WARP.md with architecture details
- **✅ Setup Instructions**: Environment setup, migration commands, server startup
- **✅ Code Organization**: Clear separation of concerns and modular structure

### Production Ready Features
- **Environment Configuration**: Separate dev/prod settings
- **Error Handling**: Comprehensive exception handling with JSON responses
- **Security Implementation**: JWT, password hashing, role-based access
- **Scalable Architecture**: Service layer, blueprint organization
- **Database Versioning**: Alembic migrations for schema changes
- **Static Asset Management**: CSS/JS organization with utility functions
