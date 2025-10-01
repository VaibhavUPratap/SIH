const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Scholarship', 'Financial Aid', 'Skill Development', 'Infrastructure', 'Other'],
    required: true
  },
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
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  applicationDeadline: Date,
  budget: {
    total: Number,
    allocated: Number,
    utilized: Number
  },
  applicants: [{
    applicantId: mongoose.Schema.Types.ObjectId,
    applicantType: {
      type: String,
      enum: ['Student', 'Teacher', 'Institution']
    },
    applicationDate: Date,
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Approved', 'Rejected', 'Disbursed']
    },
    remarks: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Scheme', schemeSchema);
