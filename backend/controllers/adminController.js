const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Institution = require('../models/Institution');
const Scheme = require('../models/Scheme');

// Get admin dashboard with comprehensive analytics
exports.getAdminDashboard = async (req, res) => {
  try {
    // Get counts
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalInstitutions = await Institution.countDocuments();
    const totalSchemes = await Scheme.countDocuments();

    const verifiedStudents = await Student.countDocuments({ isVerified: true });
    const verifiedTeachers = await Teacher.countDocuments({ isVerified: true });
    const verifiedInstitutions = await Institution.countDocuments({ isVerified: true });
    const activeSchemes = await Scheme.countDocuments({ isActive: true });

    // Get recent registrations
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email institutionId createdAt');

    const recentTeachers = await Teacher.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email institutionId createdAt');

    const recentInstitutions = await Institution.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name type aisheCode createdAt');

    // Get scheme statistics
    const schemeStats = await Scheme.aggregate([
      {
        $project: {
          name: 1,
          category: 1,
          totalApplicants: { $size: '$applicants' },
          approvedApplicants: {
            $size: {
              $filter: {
                input: '$applicants',
                as: 'applicant',
                cond: { $eq: ['$$applicant.status', 'Approved'] }
              }
            }
          }
        }
      }
    ]);

    const dashboardData = {
      overview: {
        totalStudents,
        totalTeachers,
        totalInstitutions,
        totalSchemes,
        verifiedStudents,
        verifiedTeachers,
        verifiedInstitutions,
        activeSchemes
      },
      recentActivity: {
        students: recentStudents,
        teachers: recentTeachers,
        institutions: recentInstitutions
      },
      schemeAnalytics: schemeStats
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all institutions
exports.getAllInstitutions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const institutions = await Institution.find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Institution.countDocuments();

    res.json({
      institutions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalInstitutions: total
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const students = await Student.find()
      .populate('institutionId', 'name type')
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments();

    res.json({
      students,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalStudents: total
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const teachers = await Teacher.find()
      .populate('institutionId', 'name type')
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Teacher.countDocuments();

    res.json({
      teachers,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTeachers: total
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create new scheme
exports.createScheme = async (req, res) => {
  try {
    const scheme = await Scheme.create({
      ...req.body,
      createdBy: req.user._id
    });

    res.status(201).json({ message: 'Scheme created successfully', scheme });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all schemes
exports.getAllSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ createdAt: -1 });
    res.json(schemes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update scheme
exports.updateScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    res.json({ message: 'Scheme updated successfully', scheme });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Approve/Reject scheme application
exports.updateSchemeApplication = async (req, res) => {
  try {
    const { schemeId, applicantId, status, remarks } = req.body;

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    const applicantIndex = scheme.applicants.findIndex(
      a => a.applicantId.toString() === applicantId
    );

    if (applicantIndex === -1) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    scheme.applicants[applicantIndex].status = status;
    scheme.applicants[applicantIndex].remarks = remarks;
    await scheme.save();

    // Update student/teacher/institution record
    const applicantType = scheme.applicants[applicantIndex].applicantType;
    let model;
    switch (applicantType) {
      case 'Student':
        model = Student;
        break;
      case 'Teacher':
        model = Teacher;
        break;
      case 'Institution':
        model = Institution;
        break;
    }

    const applicant = await model.findById(applicantId);
    if (applicant) {
      const schemeIndex = applicant.schemes.findIndex(
        s => s.schemeId.toString() === schemeId
      );
      if (schemeIndex !== -1) {
        applicant.schemes[schemeIndex].status = status;
        await applicant.save();
      }
    }

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Generate analytics report
exports.generateReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;

    let report = {};

    switch (reportType) {
      case 'enrollment':
        report = await generateEnrollmentReport(startDate, endDate);
        break;
      case 'performance':
        report = await generatePerformanceReport(startDate, endDate);
        break;
      case 'schemes':
        report = await generateSchemesReport(startDate, endDate);
        break;
      case 'compliance':
        report = await generateComplianceReport();
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    res.json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Helper functions for reports
async function generateEnrollmentReport(startDate, endDate) {
  const query = {};
  if (startDate && endDate) {
    query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const students = await Student.countDocuments(query);
  const teachers = await Teacher.countDocuments(query);
  const institutions = await Institution.countDocuments(query);

  return {
    type: 'enrollment',
    period: { startDate, endDate },
    data: {
      students,
      teachers,
      institutions
    }
  };
}

async function generatePerformanceReport(startDate, endDate) {
  const students = await Student.find()
    .select('name institutionId performance')
    .populate('institutionId', 'name');

  const performanceData = students.map(student => {
    const avgMarks = student.performance.length > 0
      ? student.performance.reduce((sum, p) => sum + (p.marks || 0), 0) / student.performance.length
      : 0;

    return {
      studentName: student.name,
      institution: student.institutionId?.name,
      averageMarks: avgMarks.toFixed(2),
      totalSubjects: student.performance.length
    };
  });

  return {
    type: 'performance',
    period: { startDate, endDate },
    data: performanceData
  };
}

async function generateSchemesReport(startDate, endDate) {
  const schemes = await Scheme.find().select('name category applicants budget');

  const schemeData = schemes.map(scheme => ({
    name: scheme.name,
    category: scheme.category,
    totalApplicants: scheme.applicants.length,
    approvedApplicants: scheme.applicants.filter(a => a.status === 'Approved').length,
    budgetUtilization: scheme.budget?.utilized || 0
  }));

  return {
    type: 'schemes',
    period: { startDate, endDate },
    data: schemeData
  };
}

async function generateComplianceReport() {
  const institutions = await Institution.find()
    .select('name type compliance')
    .lean();

  const complianceData = institutions.map(inst => {
    const total = inst.compliance.length;
    const compliant = inst.compliance.filter(c => c.status === 'Compliant').length;
    const percentage = total > 0 ? (compliant / total * 100).toFixed(2) : 0;

    return {
      institutionName: inst.name,
      institutionType: inst.type,
      totalRequirements: total,
      compliantRequirements: compliant,
      compliancePercentage: percentage
    };
  });

  return {
    type: 'compliance',
    data: complianceData
  };
}
