"""
Institution model for managing educational institutions, NIRF data, and compliance.
"""
from models import db
from datetime import datetime


class Institution(db.Model):
    """Institution profile model."""
    
    __tablename__ = 'institutions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    
    # Basic Information
    institution_name = db.Column(db.String(200), nullable=False)
    institution_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    aishe_code = db.Column(db.String(20), unique=True, nullable=True, index=True)
    
    # Type & Category
    institution_type = db.Column(db.String(50), nullable=False)  # University, College, Institute
    category = db.Column(db.String(50), nullable=True)  # Government, Private, Deemed, etc.
    
    # Location
    address = db.Column(db.Text, nullable=True)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    pincode = db.Column(db.String(10), nullable=True)
    
    # Contact Information
    phone_number = db.Column(db.String(15), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    website = db.Column(db.String(200), nullable=True)
    
    # Accreditation & Recognition
    ugc_recognized = db.Column(db.Boolean, default=False)
    aicte_approved = db.Column(db.Boolean, default=False)
    naac_grade = db.Column(db.String(10), nullable=True)  # A++, A+, A, B++, etc.
    naac_score = db.Column(db.Float, nullable=True)
    naac_valid_till = db.Column(db.Date, nullable=True)
    
    # NIRF Data
    nirf_rank = db.Column(db.Integer, nullable=True)
    nirf_category = db.Column(db.String(50), nullable=True)  # Overall, Engineering, etc.
    nirf_year = db.Column(db.Integer, nullable=True)
    
    # Infrastructure
    total_students = db.Column(db.Integer, default=0)
    total_faculty = db.Column(db.Integer, default=0)
    total_programs = db.Column(db.Integer, default=0)
    campus_area = db.Column(db.Float, nullable=True)  # in acres
    
    # Establishment
    year_of_establishment = db.Column(db.Integer, nullable=True)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    verified = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    students = db.relationship('Student', backref='institution', cascade='all, delete-orphan')
    teachers = db.relationship('Teacher', backref='institution', cascade='all, delete-orphan')
    nirf_data = db.relationship('NIRFData', backref='institution', cascade='all, delete-orphan')
    compliance_records = db.relationship('ComplianceRecord', backref='institution', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert institution to dictionary."""
        return {
            'id': self.id,
            'institution_name': self.institution_name,
            'institution_code': self.institution_code,
            'aishe_code': self.aishe_code,
            'institution_type': self.institution_type,
            'category': self.category,
            'city': self.city,
            'state': self.state,
            'phone_number': self.phone_number,
            'email': self.email,
            'website': self.website,
            'ugc_recognized': self.ugc_recognized,
            'aicte_approved': self.aicte_approved,
            'naac_grade': self.naac_grade,
            'naac_score': self.naac_score,
            'nirf_rank': self.nirf_rank,
            'nirf_category': self.nirf_category,
            'nirf_year': self.nirf_year,
            'total_students': self.total_students,
            'total_faculty': self.total_faculty,
            'total_programs': self.total_programs,
            'year_of_establishment': self.year_of_establishment,
            'is_active': self.is_active,
            'verified': self.verified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Institution {self.institution_name}>'


class NIRFData(db.Model):
    """NIRF (National Institutional Ranking Framework) data."""
    
    __tablename__ = 'nirf_data'
    
    id = db.Column(db.Integer, primary_key=True)
    institution_id = db.Column(db.Integer, db.ForeignKey('institutions.id'), nullable=False)
    
    # Ranking Information
    year = db.Column(db.Integer, nullable=False)
    overall_rank = db.Column(db.Integer, nullable=True)
    category = db.Column(db.String(50), nullable=False)
    category_rank = db.Column(db.Integer, nullable=True)
    
    # NIRF Parameters (out of 100 each)
    teaching_learning_resources = db.Column(db.Float, nullable=True)  # TLR - 100
    research_professional_practice = db.Column(db.Float, nullable=True)  # RP - 100
    graduation_outcomes = db.Column(db.Float, nullable=True)  # GO - 100
    outreach_inclusivity = db.Column(db.Float, nullable=True)  # OI - 100
    perception = db.Column(db.Float, nullable=True)  # PR - 100
    
    # Total Score
    total_score = db.Column(db.Float, nullable=True)
    
    # Additional Metrics
    student_strength = db.Column(db.Integer, nullable=True)
    faculty_strength = db.Column(db.Integer, nullable=True)
    phd_faculty_ratio = db.Column(db.Float, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert NIRF data to dictionary."""
        return {
            'id': self.id,
            'institution_id': self.institution_id,
            'year': self.year,
            'overall_rank': self.overall_rank,
            'category': self.category,
            'category_rank': self.category_rank,
            'teaching_learning_resources': self.teaching_learning_resources,
            'research_professional_practice': self.research_professional_practice,
            'graduation_outcomes': self.graduation_outcomes,
            'outreach_inclusivity': self.outreach_inclusivity,
            'perception': self.perception,
            'total_score': self.total_score,
            'student_strength': self.student_strength,
            'faculty_strength': self.faculty_strength
        }
    
    def __repr__(self):
        return f'<NIRFData {self.institution_id} - {self.year}>'


class ComplianceRecord(db.Model):
    """Compliance records for regulatory requirements (UGC, AICTE, etc.)."""
    
    __tablename__ = 'compliance_records'
    
    id = db.Column(db.Integer, primary_key=True)
    institution_id = db.Column(db.Integer, db.ForeignKey('institutions.id'), nullable=False)
    
    # Compliance Type
    compliance_type = db.Column(db.String(50), nullable=False)  # UGC, AICTE, NAAC, etc.
    
    # Details
    year = db.Column(db.Integer, nullable=False)
    requirement = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # compliant, non_compliant, pending
    
    # Documentation
    document_url = db.Column(db.String(500), nullable=True)
    remarks = db.Column(db.Text, nullable=True)
    
    # Review
    reviewed_by = db.Column(db.String(100), nullable=True)
    review_date = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert compliance record to dictionary."""
        return {
            'id': self.id,
            'institution_id': self.institution_id,
            'compliance_type': self.compliance_type,
            'year': self.year,
            'requirement': self.requirement,
            'status': self.status,
            'remarks': self.remarks,
            'review_date': self.review_date.isoformat() if self.review_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<ComplianceRecord {self.compliance_type} - {self.institution_id}>'
