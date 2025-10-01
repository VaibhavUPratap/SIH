const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getAllInstitutions,
  getAllStudents,
  getAllTeachers,
  createScheme,
  getAllSchemes,
  updateScheme,
  updateSchemeApplication,
  generateReport
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin'), getAdminDashboard);
router.get('/institutions', protect, authorize('admin'), getAllInstitutions);
router.get('/students', protect, authorize('admin'), getAllStudents);
router.get('/teachers', protect, authorize('admin'), getAllTeachers);
router.post('/schemes', protect, authorize('admin'), createScheme);
router.get('/schemes', protect, authorize('admin'), getAllSchemes);
router.put('/schemes/:id', protect, authorize('admin'), updateScheme);
router.post('/schemes/applications', protect, authorize('admin'), updateSchemeApplication);
router.get('/reports', protect, authorize('admin'), generateReport);

module.exports = router;
