"""
User model for authentication and authorization.
Supports multiple user roles: student, teacher, institution, ministry.
"""
from models import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    """User model for authentication."""
    
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Role-based access
    role = db.Column(db.String(20), nullable=False)  # student, teacher, institution, ministry
    
    # Aadhaar integration (for individuals)
    aadhaar_number = db.Column(db.String(12), unique=True, nullable=True, index=True)
    aadhaar_verified = db.Column(db.Boolean, default=False)
    
    # MFA
    mfa_enabled = db.Column(db.Boolean, default=False)
    mfa_secret = db.Column(db.String(32), nullable=True)
    
    # Profile
    full_name = db.Column(db.String(200), nullable=False)
    phone_number = db.Column(db.String(15), nullable=True)
    date_of_birth = db.Column(db.Date, nullable=True)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    student_profile = db.relationship('Student', backref='user', uselist=False, cascade='all, delete-orphan')
    teacher_profile = db.relationship('Teacher', backref='user', uselist=False, cascade='all, delete-orphan')
    institution_profile = db.relationship('Institution', backref='user', uselist=False, cascade='all, delete-orphan')
    audit_logs = db.relationship('AuditLog', backref='user', cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password."""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if provided password matches hash."""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self, include_sensitive=False):
        """Convert user to dictionary."""
        data = {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'role': self.role,
            'full_name': self.full_name,
            'phone_number': self.phone_number,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'aadhaar_verified': self.aadhaar_verified,
            'mfa_enabled': self.mfa_enabled,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
        
        if include_sensitive:
            data['aadhaar_number'] = self.aadhaar_number
        
        return data
    
    def __repr__(self):
        return f'<User {self.username} ({self.role})>'


class AuditLog(db.Model):
    """Audit log for tracking all user actions."""
    
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    resource_type = db.Column(db.String(50), nullable=True)
    resource_id = db.Column(db.Integer, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)
    details = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        """Convert audit log to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'resource_type': self.resource_type,
            'resource_id': self.resource_id,
            'ip_address': self.ip_address,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'details': self.details
        }
    
    def __repr__(self):
        return f'<AuditLog {self.action} by User {self.user_id}>'
