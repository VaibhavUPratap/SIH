const Institution = require('../models/Institution');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// Get institution dashboard data
exports.getInstitutionDashboard = async (req, res) => {
  try {
    const institution = await Institution.findById(req.user._id);

    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    // Get counts
    const totalStudents = await Student.countDocuments({ institutionId: institution._id });
    const totalTeachers = await Teacher.countDocuments({ institutionId: institution._id });
    const verifiedStudents = await Student.countDocuments({ 
      institutionId: institution._id, 
      isVerified: true 
    });
    const verifiedTeachers = await Teacher.countDocuments({ 
      institutionId: institution._id, 
      isVerified: true 
    });

    // Calculate compliance percentage
    const totalCompliance = institution.compliance.length;
    const compliantCount = institution.compliance.filter(c => c.status === 'Compliant').length;
    const compliancePercentage = totalCompliance > 0 
      ? (compliantCount / totalCompliance * 100).toFixed(2) 
      : 0;

    const dashboardData = {
      profile: {
        name: institution.name,
        aisheCode: institution.aisheCode,
        type: institution.type,
        email: institution.email,
        establishedYear: institution.establishedYear,
        isVerified: institution.isVerified
      },
      statistics: {
        totalStudents,
        totalTeachers,
        verifiedStudents,
        verifiedTeachers,
        compliancePercentage: parseFloat(compliancePercentage)
      },
      infrastructure: institution.infrastructure,
      departments: institution.departments,
      recentPerformance: institution.performance.slice(-5),
      compliance: institution.compliance
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all students
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find({ institutionId: req.user._id })
      .select('-password')
      .limit(100);
    res.json(students);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all teachers
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ institutionId: req.user._id })
      .select('-password')
      .limit(100);
    res.json(teachers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update institution performance
exports.updatePerformance = async (req, res) => {
  try {
    const { academicYear, passPercentage, averageGrade, ranking, achievements } = req.body;

    const institution = await Institution.findById(req.user._id);
    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    institution.performance.push({
      academicYear,
      passPercentage,
      averageGrade,
      ranking,
      achievements
    });

    await institution.save();
    res.json({ message: 'Performance updated successfully', performance: institution.performance });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update compliance
exports.updateCompliance = async (req, res) => {
  try {
    const { requirement, status, remarks } = req.body;

    const institution = await Institution.findById(req.user._id);
    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    institution.compliance.push({
      requirement,
      status,
      lastChecked: new Date(),
      remarks
    });

    await institution.save();
    res.json({ message: 'Compliance updated successfully', compliance: institution.compliance });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
