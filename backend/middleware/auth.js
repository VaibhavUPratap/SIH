const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Institution = require('../models/Institution');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'uei_secret_key_2024');

      // Get user from token
      let user;
      switch (decoded.role) {
        case 'student':
          user = await Student.findById(decoded.id).select('-password');
          break;
        case 'teacher':
          user = await Teacher.findById(decoded.id).select('-password');
          break;
        case 'institution':
          user = await Institution.findById(decoded.id).select('-password');
          break;
        case 'admin':
          user = await Admin.findById(decoded.id).select('-password');
          break;
        default:
          throw new Error('Invalid role');
      }

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
