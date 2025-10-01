"""
Authentication routes for user registration, login, and verification.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from models import db
from models.user import User, AuditLog
from services.auth_service import AuthService
from utils.decorators import validate_json
from datetime import datetime
import pyotp

auth_bp = Blueprint('auth', __name__)
auth_service = AuthService()


@auth_bp.route('/register', methods=['POST'])
@validate_json(['email', 'username', 'password', 'full_name', 'role'])
def register():
    """Register a new user."""
    data = request.get_json()
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400
    
    # Validate role
    valid_roles = ['student', 'teacher', 'institution', 'ministry']
    if data['role'] not in valid_roles:
        return jsonify({'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'}), 400
    
    # Create new user
    user = User(
        email=data['email'],
        username=data['username'],
        full_name=data['full_name'],
        role=data['role'],
        phone_number=data.get('phone_number'),
        date_of_birth=data.get('date_of_birth'),
        aadhaar_number=data.get('aadhaar_number')
    )
    user.set_password(data['password'])
    
    try:
        db.session.add(user)
        db.session.commit()
        
        # Create audit log
        log = AuditLog(
            user_id=user.id,
            action='user_registered',
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string
        )
        db.session.add(log)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
@validate_json(['username', 'password'])
def login():
    """Login user and return JWT token."""
    data = request.get_json()
    
    # Find user
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is inactive'}), 403
    
    # Check if MFA is enabled
    if user.mfa_enabled:
        # Return temporary token for MFA verification
        temp_token = create_access_token(
            identity=user.id,
            additional_claims={'mfa_pending': True}
        )
        return jsonify({
            'message': 'MFA verification required',
            'temp_token': temp_token,
            'mfa_required': True
        }), 200
    
    # Generate tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    # Update last login
    user.last_login = datetime.utcnow()
    
    # Create audit log
    log = AuditLog(
        user_id=user.id,
        action='user_login',
        ip_address=request.remote_addr,
        user_agent=request.user_agent.string
    )
    
    try:
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Login failed'}), 500
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/verify-aadhaar', methods=['POST'])
@jwt_required()
@validate_json(['aadhaar_number', 'otp'])
def verify_aadhaar():
    """Verify Aadhaar using mock API."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Mock Aadhaar verification (in production, integrate with actual Aadhaar API)
    is_valid = auth_service.verify_aadhaar_mock(
        data['aadhaar_number'],
        data['otp']
    )
    
    if is_valid:
        user.aadhaar_number = data['aadhaar_number']
        user.aadhaar_verified = True
        
        # Create audit log
        log = AuditLog(
            user_id=user.id,
            action='aadhaar_verified',
            ip_address=request.remote_addr
        )
        
        try:
            db.session.add(log)
            db.session.commit()
            return jsonify({
                'message': 'Aadhaar verified successfully',
                'user': user.to_dict()
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Invalid Aadhaar verification'}), 400


@auth_bp.route('/mfa/enable', methods=['POST'])
@jwt_required()
def enable_mfa():
    """Enable Multi-Factor Authentication."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.mfa_enabled:
        return jsonify({'error': 'MFA already enabled'}), 400
    
    # Generate MFA secret
    secret = pyotp.random_base32()
    user.mfa_secret = secret
    
    # Generate provisioning URI for QR code
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(
        name=user.email,
        issuer_name='UEI Platform'
    )
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'MFA secret generated',
            'secret': secret,
            'provisioning_uri': provisioning_uri
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/mfa/verify', methods=['POST'])
@jwt_required()
@validate_json(['token'])
def verify_mfa():
    """Verify MFA token and complete enabling."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if not user.mfa_secret:
        return jsonify({'error': 'MFA not initialized'}), 400
    
    data = request.get_json()
    totp = pyotp.TOTP(user.mfa_secret)
    
    if totp.verify(data['token']):
        user.mfa_enabled = True
        
        # Create audit log
        log = AuditLog(
            user_id=user.id,
            action='mfa_enabled',
            ip_address=request.remote_addr
        )
        
        try:
            db.session.add(log)
            db.session.commit()
            return jsonify({
                'message': 'MFA enabled successfully',
                'user': user.to_dict()
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Invalid MFA token'}), 400


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user."""
    user_id = get_jwt_identity()
    
    # Create audit log
    log = AuditLog(
        user_id=user_id,
        action='user_logout',
        ip_address=request.remote_addr,
        user_agent=request.user_agent.string
    )
    
    try:
        db.session.add(log)
        db.session.commit()
        return jsonify({'message': 'Logout successful'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()}), 200
