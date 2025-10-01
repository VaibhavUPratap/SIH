# Database Schema Documentation

## Collections

### Students
```javascript
{
  aadhaarNumber: String (unique, 12 digits),
  name: String,
  email: String (unique),
  password: String (hashed),
  dateOfBirth: Date,
  gender: String (Male/Female/Other),
  phoneNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  institutionId: ObjectId (ref: Institution),
  class: String,
  section: String,
  rollNumber: String,
  academicYear: String,
  performance: [{
    subject: String,
    marks: Number,
    grade: String,
    semester: String,
    year: String
  }],
  attendance: [{
    date: Date,
    status: String (Present/Absent/Late/Holiday)
  }],
  schemes: [{
    schemeId: ObjectId (ref: Scheme),
    appliedDate: Date,
    status: String (Applied/Approved/Rejected/Pending)
  }],
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: Date
  }],
  isVerified: Boolean,
  verificationDate: Date,
  role: String (default: 'student'),
  createdAt: Date,
  updatedAt: Date
}
```

### Teachers
```javascript
{
  aparCode: String (unique),
  aadhaarNumber: String (unique, 12 digits),
  name: String,
  email: String (unique),
  password: String (hashed),
  dateOfBirth: Date,
  gender: String (Male/Female/Other),
  phoneNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  institutionId: ObjectId (ref: Institution),
  designation: String,
  department: String,
  qualification: [{
    degree: String,
    institution: String,
    year: Number
  }],
  subjects: [String],
  experience: {
    years: Number,
    previousInstitutions: [{
      name: String,
      from: Date,
      to: Date,
      designation: String
    }]
  },
  performance: [{
    year: String,
    rating: Number,
    remarks: String,
    evaluatedBy: String,
    evaluationDate: Date
  }],
  classes: [{
    class: String,
    section: String,
    subject: String
  }],
  attendance: [{
    date: Date,
    status: String (Present/Absent/Leave/Holiday),
    leaveType: String
  }],
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: Date
  }],
  isVerified: Boolean,
  verificationDate: Date,
  role: String (default: 'teacher'),
  createdAt: Date,
  updatedAt: Date
}
```

### Institutions
```javascript
{
  aisheCode: String (unique),
  name: String,
  type: String (School/College/University/Research Institute),
  email: String (unique),
  password: String (hashed),
  phoneNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String (default: 'India')
  },
  establishedYear: Number,
  affiliatedTo: String,
  accreditation: [{
    body: String,
    grade: String,
    validFrom: Date,
    validTo: Date
  }],
  infrastructure: {
    totalClassrooms: Number,
    totalLabs: Number,
    totalLibraries: Number,
    playgrounds: Number,
    totalArea: String
  },
  statistics: {
    totalStudents: Number (default: 0),
    totalTeachers: Number (default: 0),
    totalStaff: Number (default: 0)
  },
  departments: [{
    name: String,
    headOfDepartment: String,
    courses: [String]
  }],
  performance: [{
    academicYear: String,
    passPercentage: Number,
    averageGrade: String,
    ranking: Number,
    achievements: [String]
  }],
  compliance: [{
    requirement: String,
    status: String (Compliant/Non-Compliant/Partially Compliant),
    lastChecked: Date,
    remarks: String
  }],
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: Date
  }],
  isVerified: Boolean,
  verificationDate: Date,
  role: String (default: 'institution'),
  createdAt: Date,
  updatedAt: Date
}
```

### Schemes
```javascript
{
  name: String,
  description: String,
  category: String (Scholarship/Financial Aid/Skill Development/Infrastructure/Other),
  eligibility: {
    minAge: Number,
    maxAge: Number,
    gender: String,
    category: [String],
    minIncome: Number,
    maxIncome: Number,
    institutionTypes: [String],
    states: [String]
  },
  benefits: {
    amount: Number,
    frequency: String,
    duration: String,
    type: String
  },
  startDate: Date,
  endDate: Date,
  applicationDeadline: Date,
  budget: {
    total: Number,
    allocated: Number,
    utilized: Number
  },
  applicants: [{
    applicantId: ObjectId,
    applicantType: String (Student/Teacher/Institution),
    applicationDate: Date,
    status: String (Applied/Under Review/Approved/Rejected/Disbursed),
    remarks: String
  }],
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: Admin),
  createdAt: Date,
  updatedAt: Date
}
```

### Admins
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phoneNumber: String,
  designation: String,
  department: String,
  permissions: [{
    module: String,
    actions: [String]
  }],
  role: String (default: 'admin'),
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

### Students
- `aadhaarNumber`: unique
- `email`: unique
- `institutionId`: regular

### Teachers
- `aparCode`: unique
- `aadhaarNumber`: unique
- `email`: unique
- `institutionId`: regular

### Institutions
- `aisheCode`: unique
- `email`: unique

### Schemes
- `isActive`: regular
- `category`: regular

### Admins
- `email`: unique

## Relationships

- Student → Institution (Many-to-One)
- Teacher → Institution (Many-to-One)
- Student → Scheme (Many-to-Many)
- Teacher → Scheme (Many-to-Many)
- Institution → Scheme (Many-to-Many)
- Scheme → Admin (Many-to-One)
