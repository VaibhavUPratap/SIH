const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  aparCode: {
    type: String,
    required: true,
    unique: true
  },
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
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Leave', 'Holiday']
    },
    leaveType: String
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
    default: 'teacher'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Teacher', teacherSchema);
