const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  aisheCode: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['School', 'College', 'University', 'Research Institute'],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    }
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
    totalStudents: {
      type: Number,
      default: 0
    },
    totalTeachers: {
      type: Number,
      default: 0
    },
    totalStaff: {
      type: Number,
      default: 0
    }
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
    status: {
      type: String,
      enum: ['Compliant', 'Non-Compliant', 'Partially Compliant']
    },
    lastChecked: Date,
    remarks: String
  }],
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: Date
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: Date,
  role: {
    type: String,
    default: 'institution'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Institution', institutionSchema);
