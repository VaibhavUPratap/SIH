const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  aadhaarNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{12}$/
  },
  name: {
    type: String,
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
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
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
    pincode: String
  },
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution'
  },
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
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Holiday']
    }
  }],
  schemes: [{
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme'
    },
    appliedDate: Date,
    status: {
      type: String,
      enum: ['Applied', 'Approved', 'Rejected', 'Pending']
    }
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
    default: 'student'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
