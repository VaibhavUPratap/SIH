const express = require('express');
const router = express.Router();
const {
  getStudentDashboard,
  getPerformance,
  applyForScheme,
  getAvailableSchemes
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('student'), getStudentDashboard);
router.get('/performance', protect, authorize('student'), getPerformance);
router.post('/apply-scheme', protect, authorize('student'), applyForScheme);
router.get('/schemes', protect, authorize('student'), getAvailableSchemes);

module.exports = router;
