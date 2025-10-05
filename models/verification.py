from .user import db
from datetime import datetime
import uuid

class APARRegistry(db.Model):
    """Registry of valid APAR IDs for teacher verification"""
    __tablename__ = 'apar_registry'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    apar_id = db.Column(db.String(50), unique=True, nullable=False)
    teacher_name = db.Column(db.String(200), nullable=False)
    designation = db.Column(db.String(100))
    department = db.Column(db.String(100))
    institution_name = db.Column(db.String(200))
    joining_date = db.Column(db.Date)
    status = db.Column(db.String(20), default='active')  # active, inactive, retired
    verification_level = db.Column(db.String(20), default='pending')  # pending, verified, rejected
    created_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'apar_id': self.apar_id,
            'teacher_name': self.teacher_name,
            'designation': self.designation,
            'department': self.department,
            'institution_name': self.institution_name,
            'joining_date': self.joining_date.isoformat() if self.joining_date else None,
            'status': self.status,
            'verification_level': self.verification_level,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class AISHERegistry(db.Model):
    """Registry of valid AISHE codes for institution verification"""
    __tablename__ = 'aishe_registry'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    aishe_code = db.Column(db.String(50), unique=True, nullable=False)
    institution_name = db.Column(db.String(200), nullable=False)
    institution_type = db.Column(db.String(100))  # University, College, Institute
    state = db.Column(db.String(100))
    district = db.Column(db.String(100))
    established_year = db.Column(db.Integer)
    accreditation_status = db.Column(db.String(50))  # NAAC Grade
    university_affiliation = db.Column(db.String(200))
    status = db.Column(db.String(20), default='active')  # active, inactive, closed
    verification_level = db.Column(db.String(20), default='pending')  # pending, verified, rejected
    created_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'aishe_code': self.aishe_code,
            'institution_name': self.institution_name,
            'institution_type': self.institution_type,
            'state': self.state,
            'district': self.district,
            'established_year': self.established_year,
            'accreditation_status': self.accreditation_status,
            'university_affiliation': self.university_affiliation,
            'status': self.status,
            'verification_level': self.verification_level,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class VerificationLog(db.Model):
    """Comprehensive logging system for all verification attempts"""
    __tablename__ = 'verification_logs'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    verification_type = db.Column(db.String(50), nullable=False)  # aadhaar, apar, aishe, profile
    verification_data = db.Column(db.Text)  # JSON string of verification details
    status = db.Column(db.String(20), nullable=False)  # pending, success, failed, rejected
    result_message = db.Column(db.Text)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(500))
    verified_by = db.Column(db.String(36), db.ForeignKey('users.id'))  # Admin who verified
    verification_method = db.Column(db.String(50))  # manual, api, automated
    confidence_score = db.Column(db.Float, default=0.0)  # 0.0 to 1.0
    additional_checks = db.Column(db.Text)  # JSON string of additional verification data
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='verification_logs')
    verified_by_admin = db.relationship('User', foreign_keys=[verified_by])
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'verification_type': self.verification_type,
            'verification_data': self.verification_data,
            'status': self.status,
            'result_message': self.result_message,
            'ip_address': self.ip_address,
            'verified_by': self.verified_by,
            'verification_method': self.verification_method,
            'confidence_score': self.confidence_score,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class UserVerificationStatus(db.Model):
    """Track overall verification status for each user"""
    __tablename__ = 'user_verification_status'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), unique=True, nullable=False)
    aadhaar_verified = db.Column(db.Boolean, default=False)
    profile_verified = db.Column(db.Boolean, default=False)
    document_verified = db.Column(db.Boolean, default=False)
    manual_verification_required = db.Column(db.Boolean, default=False)
    overall_status = db.Column(db.String(20), default='pending')  # pending, partial, verified, rejected
    verification_score = db.Column(db.Float, default=0.0)  # Overall verification confidence
    verification_notes = db.Column(db.Text)
    verified_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    verification_date = db.Column(db.DateTime)
    expiry_date = db.Column(db.DateTime)  # When verification expires (if applicable)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='verification_status', uselist=False)
    verified_by_admin = db.relationship('User', foreign_keys=[verified_by])
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'aadhaar_verified': self.aadhaar_verified,
            'profile_verified': self.profile_verified,
            'document_verified': self.document_verified,
            'manual_verification_required': self.manual_verification_required,
            'overall_status': self.overall_status,
            'verification_score': self.verification_score,
            'verification_notes': self.verification_notes,
            'verified_by': self.verified_by,
            'verification_date': self.verification_date.isoformat() if self.verification_date else None,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }