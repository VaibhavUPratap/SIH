const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// Get teacher dashboard data
exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user._id)
      .populate('institutionId', 'name type aisheCode');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Calculate analytics
    const totalAttendance = teacher.attendance.length;
    const presentDays = teacher.attendance.filter(a => a.status === 'Present').length;
    const attendancePercentage = totalAttendance > 0 ? (presentDays / totalAttendance * 100).toFixed(2) : 0;

    const averageRating = teacher.performance.length > 0
      ? teacher.performance.reduce((sum, p) => sum + (p.rating || 0), 0) / teacher.performance.length
      : 0;

    // Get students assigned to teacher
    const studentsCount = await Student.countDocuments({ institutionId: teacher.institutionId });

    const dashboardData = {
      profile: {
        name: teacher.name,
        email: teacher.email,
        aparCode: teacher.aparCode,
        aadhaarNumber: teacher.aadhaarNumber.replace(/\d(?=\d{4})/g, '*'),
        designation: teacher.designation,
        department: teacher.department,
        isVerified: teacher.isVerified,
        institution: teacher.institutionId
      },
      analytics: {
        attendancePercentage: parseFloat(attendancePercentage),
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalClasses: teacher.classes.length,
        experienceYears: teacher.experience?.years || 0,
        studentsCount
      },
      classes: teacher.classes,
      recentPerformance: teacher.performance.slice(-5),
      recentAttendance: teacher.attendance.slice(-10)
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get students by class
exports.getStudentsByClass = async (req, res) => {
  try {
    const { classId, section } = req.query;
    const teacher = await Teacher.findById(req.user._id);

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const students = await Student.find({
      institutionId: teacher.institutionId,
      class: classId,
      section: section
    }).select('-password');

    res.json(students);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update student performance
exports.updateStudentPerformance = async (req, res) => {
  try {
    const { studentId, subject, marks, grade, semester, year } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.performance.push({
      subject,
      marks,
      grade,
      semester,
      year
    });

    await student.save();
    res.json({ message: 'Performance updated successfully', performance: student.performance });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mark attendance
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, date, status } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.attendance.push({
      date: new Date(date),
      status
    });

    await student.save();
    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
