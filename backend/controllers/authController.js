const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Institution = require('../models/Institution');
const Admin = require('../models/Admin');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'uei_secret_key_2024', {
    expiresIn: '30d',
  });
};

// Register Student
exports.registerStudent = async (req, res) => {
  try {
    const { aadhaarNumber, name, email, password, dateOfBirth, gender, phoneNumber } = req.body;

    // Check if student exists
    const studentExists = await Student.findOne({ $or: [{ email }, { aadhaarNumber }] });
    if (studentExists) {
      return res.status(400).json({ message: 'Student already exists with this email or Aadhaar' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create student
    const student = await Student.create({
      aadhaarNumber,
      name,
      email,
      password: hashedPassword,
      dateOfBirth,
      gender,
      phoneNumber
    });

    if (student) {
      res.status(201).json({
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        token: generateToken(student._id, student.role)
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Register Teacher
exports.registerTeacher = async (req, res) => {
  try {
    const { aparCode, aadhaarNumber, name, email, password, dateOfBirth, gender, phoneNumber } = req.body;

    // Check if teacher exists
    const teacherExists = await Teacher.findOne({ $or: [{ email }, { aadhaarNumber }, { aparCode }] });
    if (teacherExists) {
      return res.status(400).json({ message: 'Teacher already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create teacher
    const teacher = await Teacher.create({
      aparCode,
      aadhaarNumber,
      name,
      email,
      password: hashedPassword,
      dateOfBirth,
      gender,
      phoneNumber
    });

    if (teacher) {
      res.status(201).json({
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        token: generateToken(teacher._id, teacher.role)
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Register Institution
exports.registerInstitution = async (req, res) => {
  try {
    const { aisheCode, name, type, email, password, phoneNumber } = req.body;

    // Check if institution exists
    const institutionExists = await Institution.findOne({ $or: [{ email }, { aisheCode }] });
    if (institutionExists) {
      return res.status(400).json({ message: 'Institution already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create institution
    const institution = await Institution.create({
      aisheCode,
      name,
      type,
      email,
      password: hashedPassword,
      phoneNumber
    });

    if (institution) {
      res.status(201).json({
        _id: institution._id,
        name: institution.name,
        email: institution.email,
        role: institution.role,
        token: generateToken(institution._id, institution.role)
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let user;
    switch (role) {
      case 'student':
        user = await Student.findOne({ email });
        break;
      case 'teacher':
        user = await Teacher.findOne({ email });
        break;
      case 'institution':
        user = await Institution.findOne({ email });
        break;
      case 'admin':
        user = await Admin.findOne({ email });
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Verify Aadhaar
exports.verifyAadhaar = async (req, res) => {
  try {
    const { aadhaarNumber, userId, userType } = req.body;

    // In a real system, this would integrate with UIDAI API
    // For now, we'll simulate verification
    
    let user;
    switch (userType) {
      case 'student':
        user = await Student.findById(userId);
        break;
      case 'teacher':
        user = await Teacher.findById(userId);
        break;
      default:
        return res.status(400).json({ message: 'Invalid user type' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.aadhaarNumber !== aadhaarNumber) {
      return res.status(400).json({ message: 'Aadhaar number does not match' });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationDate = new Date();
    await user.save();

    res.json({ message: 'Aadhaar verified successfully', verified: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
