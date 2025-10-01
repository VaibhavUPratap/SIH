const Student = require('../models/Student');
const Scheme = require('../models/Scheme');

// Get student dashboard data
exports.getStudentDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id)
      .populate('institutionId', 'name type aisheCode')
      .populate('schemes.schemeId', 'name category benefits');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Calculate analytics
    const totalAttendance = student.attendance.length;
    const presentDays = student.attendance.filter(a => a.status === 'Present').length;
    const attendancePercentage = totalAttendance > 0 ? (presentDays / totalAttendance * 100).toFixed(2) : 0;

    const averageMarks = student.performance.length > 0
      ? student.performance.reduce((sum, p) => sum + (p.marks || 0), 0) / student.performance.length
      : 0;

    const dashboardData = {
      profile: {
        name: student.name,
        email: student.email,
        aadhaarNumber: student.aadhaarNumber.replace(/\d(?=\d{4})/g, '*'),
        class: student.class,
        section: student.section,
        rollNumber: student.rollNumber,
        isVerified: student.isVerified,
        institution: student.institutionId
      },
      analytics: {
        attendancePercentage: parseFloat(attendancePercentage),
        averageMarks: parseFloat(averageMarks.toFixed(2)),
        totalSubjects: student.performance.length,
        appliedSchemes: student.schemes.length,
        approvedSchemes: student.schemes.filter(s => s.status === 'Approved').length
      },
      recentPerformance: student.performance.slice(-5),
      recentAttendance: student.attendance.slice(-10),
      schemes: student.schemes
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get student performance
exports.getPerformance = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ performance: student.performance });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Apply for scheme
exports.applyForScheme = async (req, res) => {
  try {
    const { schemeId } = req.body;
    const student = await Student.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    // Check if already applied
    const alreadyApplied = student.schemes.some(s => s.schemeId.toString() === schemeId);
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied for this scheme' });
    }

    // Add to student's schemes
    student.schemes.push({
      schemeId,
      appliedDate: new Date(),
      status: 'Applied'
    });
    await student.save();

    // Add to scheme's applicants
    scheme.applicants.push({
      applicantId: student._id,
      applicantType: 'Student',
      applicationDate: new Date(),
      status: 'Applied'
    });
    await scheme.save();

    res.json({ message: 'Application submitted successfully', scheme: student.schemes.slice(-1)[0] });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get available schemes
exports.getAvailableSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find({ isActive: true });
    res.json(schemes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
