const express = require('express');
const router = express.Router();
const {
  getInstitutionDashboard,
  getStudents,
  getTeachers,
  updatePerformance,
  updateCompliance
} = require('../controllers/institutionController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('institution'), getInstitutionDashboard);
router.get('/students', protect, authorize('institution'), getStudents);
router.get('/teachers', protect, authorize('institution'), getTeachers);
router.post('/update-performance', protect, authorize('institution'), updatePerformance);
router.post('/update-compliance', protect, authorize('institution'), updateCompliance);

module.exports = router;
