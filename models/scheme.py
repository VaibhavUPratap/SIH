"""
Scheme model for managing government schemes and applications.
"""
from models import db
from datetime import datetime


class Scheme(db.Model):
    """Government scheme model."""
    
    __tablename__ = 'schemes'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Scheme Information
    scheme_name = db.Column(db.String(200), nullable=False)
    scheme_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    scheme_type = db.Column(db.String(50), nullable=False)  # scholarship, fellowship, grant, etc.
    
    # Details
    description = db.Column(db.Text, nullable=True)
    department = db.Column(db.String(100), nullable=True)  # MoE, UGC, AICTE, etc.
    
    # Eligibility Criteria
    eligibility_criteria = db.Column(db.Text, nullable=True)  # JSON string
    target_group = db.Column(db.String(50), nullable=True)  # student, teacher, institution
    
    # Financial Details
    amount_min = db.Column(db.Float, nullable=True)
    amount_max = db.Column(db.Float, nullable=True)
    
    # Timeline
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    application_deadline = db.Column(db.Date, nullable=True)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    
    # Contact
    contact_email = db.Column(db.String(120), nullable=True)
    contact_phone = db.Column(db.String(15), nullable=True)
    website = db.Column(db.String(200), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    applications = db.relationship('SchemeApplication', backref='scheme', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert scheme to dictionary."""
        return {
            'id': self.id,
            'scheme_name': self.scheme_name,
            'scheme_code': self.scheme_code,
            'scheme_type': self.scheme_type,
            'description': self.description,
            'department': self.department,
            'target_group': self.target_group,
            'amount_min': self.amount_min,
            'amount_max': self.amount_max,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'application_deadline': self.application_deadline.isoformat() if self.application_deadline else None,
            'is_active': self.is_active,
            'website': self.website,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Scheme {self.scheme_name}>'


class SchemeApplication(db.Model):
    """Scheme application model."""
    
    __tablename__ = 'scheme_applications'
    
    id = db.Column(db.Integer, primary_key=True)
    scheme_id = db.Column(db.Integer, db.ForeignKey('schemes.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    
    # Application Information
    application_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    application_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Status
    status = db.Column(db.String(20), default='submitted')  # submitted, under_review, approved, rejected, disbursed
    
    # Financial
    requested_amount = db.Column(db.Float, nullable=True)
    approved_amount = db.Column(db.Float, nullable=True)
    disbursed_amount = db.Column(db.Float, nullable=True)
    
    # Documents
    documents = db.Column(db.Text, nullable=True)  # JSON string with document URLs
    
    # Review
    reviewer_comments = db.Column(db.Text, nullable=True)
    reviewed_by = db.Column(db.String(100), nullable=True)
    review_date = db.Column(db.DateTime, nullable=True)
    
    # Disbursement
    disbursement_date = db.Column(db.DateTime, nullable=True)
    bank_account = db.Column(db.String(50), nullable=True)
    ifsc_code = db.Column(db.String(20), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert application to dictionary."""
        return {
            'id': self.id,
            'scheme_id': self.scheme_id,
            'student_id': self.student_id,
            'application_number': self.application_number,
            'application_date': self.application_date.isoformat() if self.application_date else None,
            'status': self.status,
            'requested_amount': self.requested_amount,
            'approved_amount': self.approved_amount,
            'disbursed_amount': self.disbursed_amount,
            'review_date': self.review_date.isoformat() if self.review_date else None,
            'disbursement_date': self.disbursement_date.isoformat() if self.disbursement_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<SchemeApplication {self.application_number}>'
