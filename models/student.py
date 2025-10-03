from .user import db
from datetime import datetime
import uuid

class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    enrollment_no = db.Column(db.String(50), unique=True, nullable=False)
    courses = db.Column(db.Text)  # JSON string of courses
    projects = db.Column(db.Text)  # JSON string of projects
    certificates = db.Column(db.Text)  # JSON string of certificates
    achievements = db.Column(db.Text)  # JSON string of achievements
    academic_progress = db.Column(db.Float, default=0.0)
    current_gpa = db.Column(db.Float, default=0.0)
    semester = db.Column(db.Integer, default=1)
    institution_id = db.Column(db.String(36), db.ForeignKey('institutions.id'))
    government_schemes = db.Column(db.Text)  # JSON string of schemes participated in
    career_goals = db.Column(db.Text)
    skills = db.Column(db.Text)  # JSON string of skills
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'enrollment_no': self.enrollment_no,
            'courses': self.courses,
            'projects': self.projects,
            'certificates': self.certificates,
            'achievements': self.achievements,
            'academic_progress': self.academic_progress,
            'current_gpa': self.current_gpa,
            'semester': self.semester,
            'institution_id': self.institution_id,
            'government_schemes': self.government_schemes,
            'career_goals': self.career_goals,
            'skills': self.skills,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
