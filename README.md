# UEI - Unified Education Interface

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D4.0-green.svg)

## 🎓 Overview

The **Unified Education Interface (UEI)** is a centralized platform that integrates student, teacher, and institutional data using Aadhaar, APAR, and AISHE codes for verification. It enables secure storage, role-based dashboards, and AI-driven analytics for tracking performance, schemes, and compliance. UEI streamlines reporting, enhances transparency, and empowers the Ministry of Education with data-driven decision-making.

## ✨ Key Features

### 🔐 Secure Verification System
- **Aadhaar Integration** - Student and teacher identity verification
- **APAR Code** - Teacher performance appraisal recognition
- **AISHE Code** - Institution identification and verification

### 👥 Role-Based Dashboards
- **Student Dashboard** - Performance tracking, attendance, scheme applications
- **Teacher Dashboard** - Class management, performance reviews, student monitoring
- **Institution Dashboard** - Student/teacher management, compliance tracking, analytics
- **Admin Dashboard** - Comprehensive oversight, scheme management, reporting

### 📊 AI-Driven Analytics
- Performance trend analysis
- Attendance patterns
- Scheme utilization metrics
- Compliance monitoring
- Predictive insights

### 📝 Scheme Management
- Scholarship applications
- Financial aid tracking
- Skill development programs
- Infrastructure grants
- Automated eligibility checking

### ✅ Compliance Monitoring
- Real-time compliance status
- Requirement tracking
- Automated reporting
- Audit trail maintenance

### 📈 Comprehensive Reporting
- Enrollment reports
- Performance analytics
- Scheme utilization reports
- Compliance dashboards
- Custom report generation

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI framework
- **React Router** - Navigation
- **Axios** - API client
- **CSS3** - Styling

## 📁 Project Structure

```
SIH/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── teacherController.js
│   │   ├── institutionController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Student.js
│   │   ├── Teacher.js
│   │   ├── Institution.js
│   │   ├── Scheme.js
│   │   └── Admin.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── teacherRoutes.js
│   │   ├── institutionRoutes.js
│   │   └── adminRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── StudentDashboard.js
│   │   │   ├── TeacherDashboard.js
│   │   │   ├── InstitutionDashboard.js
│   │   │   └── AdminDashboard.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── docs/
│   ├── API_DOCUMENTATION.md
│   └── DATABASE_SCHEMA.md
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/VaibhavUPratap/SIH.git
cd SIH
```

2. **Setup Backend**
```bash
cd backend
npm install
```

3. **Configure Environment Variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/uei
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

4. **Setup Frontend**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start MongoDB**
```bash
mongod
```

2. **Start Backend Server**
```bash
cd backend
npm start
```
Backend will run on http://localhost:5000

3. **Start Frontend (in a new terminal)**
```bash
cd frontend
npm start
```
Frontend will run on http://localhost:3000

## 📖 API Documentation

Detailed API documentation is available in [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

### Quick API Reference

**Base URL:** `http://localhost:5000/api`

#### Authentication
- `POST /auth/register/student` - Register a student
- `POST /auth/register/teacher` - Register a teacher
- `POST /auth/register/institution` - Register an institution
- `POST /auth/login` - Login
- `POST /auth/verify-aadhaar` - Verify Aadhaar

#### Student Routes
- `GET /student/dashboard` - Get student dashboard
- `POST /student/apply-scheme` - Apply for a scheme
- `GET /student/schemes` - Get available schemes

#### Teacher Routes
- `GET /teacher/dashboard` - Get teacher dashboard
- `GET /teacher/students` - Get students by class
- `POST /teacher/update-performance` - Update student performance

#### Institution Routes
- `GET /institution/dashboard` - Get institution dashboard
- `GET /institution/students` - Get all students
- `POST /institution/update-compliance` - Update compliance

#### Admin Routes
- `GET /admin/dashboard` - Get admin dashboard
- `POST /admin/schemes` - Create a scheme
- `GET /admin/reports` - Generate reports

## 🗄️ Database Schema

Database schema documentation is available in [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)

### Main Collections
- **Students** - Student information and performance
- **Teachers** - Teacher profiles and evaluations
- **Institutions** - Institution details and compliance
- **Schemes** - Educational schemes and applications
- **Admins** - Ministry administrators

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- Aadhaar number masking in responses
- Input validation and sanitization
- Protected API routes

## 🎯 Use Cases

### For Students
- View academic performance
- Track attendance
- Apply for scholarships and schemes
- Access personalized dashboard

### For Teachers
- Manage class attendance
- Update student performance
- View teaching assignments
- Track professional development

### For Institutions
- Monitor overall performance
- Track compliance requirements
- Manage student and teacher data
- Generate institutional reports

### For Ministry of Education
- Oversee all institutions
- Manage educational schemes
- Generate analytical reports
- Track national education metrics
- Monitor compliance across institutions

## 📊 Key Metrics Tracked

- Student enrollment and performance
- Teacher qualifications and performance
- Institution compliance status
- Scheme applications and approvals
- Attendance patterns
- Academic achievements
- Infrastructure utilization

## 🔄 Future Enhancements

- [ ] Mobile application
- [ ] Real-time notifications
- [ ] Advanced AI/ML analytics
- [ ] Integration with DIGILOCKER
- [ ] Biometric authentication
- [ ] Video conferencing integration
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Blockchain for certificate verification

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 👥 Team

Smart India Hackathon Project Team

## 📧 Contact

For any queries or support, please contact:
- Email: support@uei.edu.in
- Website: https://uei.edu.in

## 🙏 Acknowledgments

- Ministry of Education, Government of India
- Smart India Hackathon organizing committee
- All contributors and supporters

---

**Made with ❤️ for transforming education in India**

