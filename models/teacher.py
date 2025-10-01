"""
Teacher model for managing teacher profiles, APAR, and contributions.
"""
from models import db
from datetime import datetime


class Teacher(db.Model):
    """Teacher profile model."""
    
    __tablename__ = 'teachers'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    
    # Professional Information
    employee_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    institution_id = db.Column(db.Integer, db.ForeignKey('institutions.id'), nullable=True)
    
    # Academic Details
    designation = db.Column(db.String(100), nullable=False)  # Professor, Associate Prof, Assistant Prof
    department = db.Column(db.String(100), nullable=False)
    specialization = db.Column(db.String(200), nullable=True)
    
    # Qualifications
    highest_qualification = db.Column(db.String(50), nullable=True)  # Ph.D., M.Tech, etc.
    qualification_year = db.Column(db.Integer, nullable=True)
    university = db.Column(db.String(200), nullable=True)
    
    # Employment Details
    date_of_joining = db.Column(db.Date, nullable=False)
    employment_type = db.Column(db.String(20), nullable=True)  # Permanent, Contract, Visiting
    
    # Contact & Personal
    office_address = db.Column(db.Text, nullable=True)
    office_phone = db.Column(db.String(15), nullable=True)
    
    # Research & Publications
    total_publications = db.Column(db.Integer, default=0)
    total_citations = db.Column(db.Integer, default=0)
    h_index = db.Column(db.Integer, default=0)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    apar_records = db.relationship('APARRecord', backref='teacher', cascade='all, delete-orphan')
    contributions = db.relationship('AcademicContribution', backref='teacher', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert teacher to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'employee_id': self.employee_id,
            'institution_id': self.institution_id,
            'designation': self.designation,
            'department': self.department,
            'specialization': self.specialization,
            'highest_qualification': self.highest_qualification,
            'qualification_year': self.qualification_year,
            'university': self.university,
            'date_of_joining': self.date_of_joining.isoformat() if self.date_of_joining else None,
            'employment_type': self.employment_type,
            'total_publications': self.total_publications,
            'total_citations': self.total_citations,
            'h_index': self.h_index,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Teacher {self.employee_id}>'


class APARRecord(db.Model):
    """Annual Performance Appraisal Report (APAR) for teachers."""
    
    __tablename__ = 'apar_records'
    
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id'), nullable=False)
    
    # Assessment Period
    year = db.Column(db.Integer, nullable=False)
    assessment_period = db.Column(db.String(20), nullable=False)  # e.g., "2023-2024"
    
    # Performance Metrics
    teaching_score = db.Column(db.Float, nullable=True)
    research_score = db.Column(db.Float, nullable=True)
    administrative_score = db.Column(db.Float, nullable=True)
    overall_score = db.Column(db.Float, nullable=True)
    grade = db.Column(db.String(10), nullable=True)  # Outstanding, Very Good, Good, etc.
    
    # Achievements
    courses_taught = db.Column(db.Integer, default=0)
    students_guided = db.Column(db.Integer, default=0)
    publications = db.Column(db.Integer, default=0)
    conferences_attended = db.Column(db.Integer, default=0)
    
    # Self-Assessment
    self_assessment = db.Column(db.Text, nullable=True)
    
    # Supervisor Assessment
    supervisor_comments = db.Column(db.Text, nullable=True)
    supervisor_id = db.Column(db.Integer, db.ForeignKey('teachers.id'), nullable=True)
    
    # Status
    status = db.Column(db.String(20), default='draft')  # draft, submitted, under_review, approved
    submitted_date = db.Column(db.DateTime, nullable=True)
    approved_date = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert APAR record to dictionary."""
        return {
            'id': self.id,
            'teacher_id': self.teacher_id,
            'year': self.year,
            'assessment_period': self.assessment_period,
            'teaching_score': self.teaching_score,
            'research_score': self.research_score,
            'administrative_score': self.administrative_score,
            'overall_score': self.overall_score,
            'grade': self.grade,
            'courses_taught': self.courses_taught,
            'students_guided': self.students_guided,
            'publications': self.publications,
            'conferences_attended': self.conferences_attended,
            'status': self.status,
            'submitted_date': self.submitted_date.isoformat() if self.submitted_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<APARRecord {self.teacher_id} - {self.assessment_period}>'


class AcademicContribution(db.Model):
    """Academic contributions by teachers (publications, projects, etc.)."""
    
    __tablename__ = 'academic_contributions'
    
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id'), nullable=False)
    
    # Contribution Type
    contribution_type = db.Column(db.String(50), nullable=False)  # publication, project, patent, award
    
    # Details
    title = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text, nullable=True)
    year = db.Column(db.Integer, nullable=True)
    
    # Publication Specific
    journal_name = db.Column(db.String(200), nullable=True)
    doi = db.Column(db.String(100), nullable=True)
    citations = db.Column(db.Integer, default=0)
    impact_factor = db.Column(db.Float, nullable=True)
    
    # Project Specific
    funding_agency = db.Column(db.String(200), nullable=True)
    project_amount = db.Column(db.Float, nullable=True)
    project_status = db.Column(db.String(20), nullable=True)  # ongoing, completed
    
    # Collaboration
    co_authors = db.Column(db.Text, nullable=True)  # JSON string
    
    # Verification
    verified = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert contribution to dictionary."""
        return {
            'id': self.id,
            'teacher_id': self.teacher_id,
            'contribution_type': self.contribution_type,
            'title': self.title,
            'description': self.description,
            'year': self.year,
            'journal_name': self.journal_name,
            'doi': self.doi,
            'citations': self.citations,
            'verified': self.verified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<AcademicContribution {self.contribution_type} - {self.title}>'
