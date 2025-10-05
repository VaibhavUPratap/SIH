from .user import db
from datetime import datetime
import uuid

class GovernmentScheme(db.Model):
    __tablename__ = 'government_schemes'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scheme_name = db.Column(db.String(200), nullable=False)
    scheme_code = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    eligibility_criteria = db.Column(db.Text)  # JSON string of criteria
    benefits = db.Column(db.Text)  # JSON string of benefits
    application_process = db.Column(db.Text)
    scheme_category = db.Column(db.String(100))  # Scholarship, Infrastructure, etc.
    target_group = db.Column(db.String(100))  # Students, Institutions, Teachers
    funding_amount = db.Column(db.Float)
    max_beneficiaries = db.Column(db.Integer)
    current_beneficiaries = db.Column(db.Integer, default=0)
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    ministry_department = db.Column(db.String(200))
    contact_details = db.Column(db.Text)  # JSON string of contact info
    documents_required = db.Column(db.Text)  # JSON string of required documents
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'scheme_name': self.scheme_name,
            'scheme_code': self.scheme_code,
            'description': self.description,
            'eligibility_criteria': self.eligibility_criteria,
            'benefits': self.benefits,
            'application_process': self.application_process,
            'scheme_category': self.scheme_category,
            'target_group': self.target_group,
            'funding_amount': self.funding_amount,
            'max_beneficiaries': self.max_beneficiaries,
            'current_beneficiaries': self.current_beneficiaries,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'is_active': self.is_active,
            'ministry_department': self.ministry_department,
            'contact_details': self.contact_details,
            'documents_required': self.documents_required,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class SchemeApplication(db.Model):
    __tablename__ = 'scheme_applications'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scheme_id = db.Column(db.String(36), db.ForeignKey('government_schemes.id'), nullable=False)
    applicant_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    applicant_type = db.Column(db.String(20), nullable=False)  # student, institution, teacher
    application_status = db.Column(db.String(50), default='pending')  # pending, approved, rejected, under_review
    submitted_documents = db.Column(db.Text)  # JSON string of document URLs/paths
    application_data = db.Column(db.Text)  # JSON string of application form data
    review_comments = db.Column(db.Text)
    approved_amount = db.Column(db.Float)
    application_date = db.Column(db.DateTime, default=datetime.utcnow)
    review_date = db.Column(db.DateTime)
    disbursement_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    scheme = db.relationship('GovernmentScheme', backref='applications')
    applicant = db.relationship('User', backref='scheme_applications')
    
    def to_dict(self):
        return {
            'id': self.id,
            'scheme_id': self.scheme_id,
            'applicant_id': self.applicant_id,
            'applicant_type': self.applicant_type,
            'application_status': self.application_status,
            'submitted_documents': self.submitted_documents,
            'application_data': self.application_data,
            'review_comments': self.review_comments,
            'approved_amount': self.approved_amount,
            'application_date': self.application_date.isoformat() if self.application_date else None,
            'review_date': self.review_date.isoformat() if self.review_date else None,
            'disbursement_date': self.disbursement_date.isoformat() if self.disbursement_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }