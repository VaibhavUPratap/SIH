"""
Student model for managing student profiles and academic data.
"""
from models import db
from datetime import datetime


class Student(db.Model):
    """Student profile model."""
    
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    
    # Academic Information
    enrollment_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    aishe_code = db.Column(db.String(20), nullable=True)  # AISHE institution code
    institution_id = db.Column(db.Integer, db.ForeignKey('institutions.id'), nullable=True)
    
    # Program Details
    program = db.Column(db.String(100), nullable=False)  # e.g., B.Tech, M.Sc
    specialization = db.Column(db.String(100), nullable=True)
    year_of_study = db.Column(db.Integer, nullable=True)
    semester = db.Column(db.Integer, nullable=True)
    
    # Enrollment Status
    enrollment_date = db.Column(db.Date, nullable=False)
    expected_graduation_date = db.Column(db.Date, nullable=True)
    current_status = db.Column(db.String(20), default='enrolled')  # enrolled, graduated, dropped, suspended
    
    # Academic Performance
    cgpa = db.Column(db.Float, nullable=True)
    percentage = db.Column(db.Float, nullable=True)
    
    # Personal Details
    father_name = db.Column(db.String(200), nullable=True)
    mother_name = db.Column(db.String(200), nullable=True)
    category = db.Column(db.String(20), nullable=True)  # General, OBC, SC, ST, etc.
    gender = db.Column(db.String(20), nullable=True)
    address = db.Column(db.Text, nullable=True)
    city = db.Column(db.String(100), nullable=True)
    state = db.Column(db.String(100), nullable=True)
    pincode = db.Column(db.String(10), nullable=True)
    
    # Financial Information
    annual_family_income = db.Column(db.Float, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    performances = db.relationship('StudentPerformance', backref='student', cascade='all, delete-orphan')
    scheme_applications = db.relationship('SchemeApplication', backref='student', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert student to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'enrollment_number': self.enrollment_number,
            'aishe_code': self.aishe_code,
            'institution_id': self.institution_id,
            'program': self.program,
            'specialization': self.specialization,
            'year_of_study': self.year_of_study,
            'semester': self.semester,
            'enrollment_date': self.enrollment_date.isoformat() if self.enrollment_date else None,
            'expected_graduation_date': self.expected_graduation_date.isoformat() if self.expected_graduation_date else None,
            'current_status': self.current_status,
            'cgpa': self.cgpa,
            'percentage': self.percentage,
            'father_name': self.father_name,
            'mother_name': self.mother_name,
            'category': self.category,
            'gender': self.gender,
            'city': self.city,
            'state': self.state,
            'annual_family_income': self.annual_family_income,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Student {self.enrollment_number}>'


class StudentPerformance(db.Model):
    """Student academic performance tracking."""
    
    __tablename__ = 'student_performances'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    
    # Semester Information
    academic_year = db.Column(db.String(10), nullable=False)  # e.g., "2023-24"
    semester = db.Column(db.Integer, nullable=False)
    
    # Performance Metrics
    sgpa = db.Column(db.Float, nullable=True)
    cgpa = db.Column(db.Float, nullable=True)
    percentage = db.Column(db.Float, nullable=True)
    credits_earned = db.Column(db.Integer, nullable=True)
    
    # Achievements
    rank = db.Column(db.Integer, nullable=True)
    awards = db.Column(db.Text, nullable=True)  # JSON string
    
    # Attendance
    attendance_percentage = db.Column(db.Float, nullable=True)
    
    # Remarks
    remarks = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert performance to dictionary."""
        return {
            'id': self.id,
            'student_id': self.student_id,
            'academic_year': self.academic_year,
            'semester': self.semester,
            'sgpa': self.sgpa,
            'cgpa': self.cgpa,
            'percentage': self.percentage,
            'credits_earned': self.credits_earned,
            'rank': self.rank,
            'attendance_percentage': self.attendance_percentage,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<StudentPerformance {self.student_id} - {self.academic_year} Sem {self.semester}>'
