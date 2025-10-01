const express = require('express');
const router = express.Router();
const {
  getTeacherDashboard,
  getStudentsByClass,
  updateStudentPerformance,
  markAttendance
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('teacher'), getTeacherDashboard);
router.get('/students', protect, authorize('teacher'), getStudentsByClass);
router.post('/update-performance', protect, authorize('teacher'), updateStudentPerformance);
router.post('/mark-attendance', protect, authorize('teacher'), markAttendance);

module.exports = router;
