const express = require('express');
const router = express.Router();
const {
  registerStudent,
  registerTeacher,
  registerInstitution,
  login,
  verifyAadhaar,
  getProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register/student', registerStudent);
router.post('/register/teacher', registerTeacher);
router.post('/register/institution', registerInstitution);
router.post('/login', login);
router.post('/verify-aadhaar', verifyAadhaar);
router.get('/profile', protect, getProfile);

module.exports = router;
