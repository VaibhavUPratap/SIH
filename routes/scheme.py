"""
Scheme routes for managing government schemes and applications.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.user import User
from models.scheme import Scheme, SchemeApplication
from models.student import Student
from utils.decorators import role_required, validate_json
from datetime import datetime

scheme_bp = Blueprint('scheme', __name__)


@scheme_bp.route('', methods=['GET'])
@jwt_required()
def list_schemes():
    """List all schemes."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    is_active = request.args.get('is_active', None)
    target_group = request.args.get('target_group', None)
    
    query = Scheme.query
    
    if is_active is not None:
        query = query.filter_by(is_active=is_active.lower() == 'true')
    
    if target_group:
        query = query.filter_by(target_group=target_group)
    
    schemes = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'schemes': [s.to_dict() for s in schemes.items],
        'total': schemes.total,
        'pages': schemes.pages,
        'current_page': schemes.page
    }), 200


@scheme_bp.route('/<int:scheme_id>', methods=['GET'])
@jwt_required()
def get_scheme(scheme_id):
    """Get scheme details."""
    scheme = Scheme.query.get(scheme_id)
    if not scheme:
        return jsonify({'error': 'Scheme not found'}), 404
    
    return jsonify({'scheme': scheme.to_dict()}), 200


@scheme_bp.route('', methods=['POST'])
@jwt_required()
@role_required(['ministry'])
@validate_json(['scheme_name', 'scheme_code', 'scheme_type'])
def create_scheme():
    """Create a new scheme (ministry only)."""
    data = request.get_json()
    
    # Check for duplicate scheme code
    if Scheme.query.filter_by(scheme_code=data['scheme_code']).first():
        return jsonify({'error': 'Scheme code already exists'}), 400
    
    scheme = Scheme(
        scheme_name=data['scheme_name'],
        scheme_code=data['scheme_code'],
        scheme_type=data['scheme_type'],
        description=data.get('description'),
        department=data.get('department'),
        eligibility_criteria=data.get('eligibility_criteria'),
        target_group=data.get('target_group'),
        amount_min=data.get('amount_min'),
        amount_max=data.get('amount_max'),
        start_date=data.get('start_date'),
        end_date=data.get('end_date'),
        application_deadline=data.get('application_deadline'),
        contact_email=data.get('contact_email'),
        contact_phone=data.get('contact_phone'),
        website=data.get('website')
    )
    
    try:
        db.session.add(scheme)
        db.session.commit()
        return jsonify({
            'message': 'Scheme created successfully',
            'scheme': scheme.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@scheme_bp.route('/<int:scheme_id>/apply', methods=['POST'])
@jwt_required()
@role_required(['student'])
@validate_json(['requested_amount'])
def apply_for_scheme(scheme_id):
    """Apply for a scheme."""
    user_id = get_jwt_identity()
    
    scheme = Scheme.query.get(scheme_id)
    if not scheme:
        return jsonify({'error': 'Scheme not found'}), 404
    
    if not scheme.is_active:
        return jsonify({'error': 'Scheme is not active'}), 400
    
    # Get student profile
    student = Student.query.filter_by(user_id=user_id).first()
    if not student:
        return jsonify({'error': 'Student profile not found'}), 404
    
    # Check if already applied
    existing = SchemeApplication.query.filter_by(
        scheme_id=scheme_id,
        student_id=student.id
    ).first()
    
    if existing:
        return jsonify({'error': 'Already applied for this scheme'}), 400
    
    data = request.get_json()
    
    # Generate application number
    import random
    application_number = f"APP{scheme_id}{student.id}{random.randint(1000, 9999)}"
    
    application = SchemeApplication(
        scheme_id=scheme_id,
        student_id=student.id,
        application_number=application_number,
        requested_amount=data['requested_amount'],
        documents=data.get('documents'),
        bank_account=data.get('bank_account'),
        ifsc_code=data.get('ifsc_code')
    )
    
    try:
        db.session.add(application)
        db.session.commit()
        return jsonify({
            'message': 'Application submitted successfully',
            'application': application.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@scheme_bp.route('/<int:scheme_id>/beneficiaries', methods=['GET'])
@jwt_required()
@role_required(['ministry', 'institution'])
def get_beneficiaries(scheme_id):
    """Get beneficiaries of a scheme."""
    scheme = Scheme.query.get(scheme_id)
    if not scheme:
        return jsonify({'error': 'Scheme not found'}), 404
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    applications = SchemeApplication.query.filter_by(scheme_id=scheme_id).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'scheme_id': scheme_id,
        'beneficiaries': [a.to_dict() for a in applications.items],
        'total': applications.total,
        'pages': applications.pages,
        'current_page': applications.page
    }), 200


@scheme_bp.route('/applications/<int:application_id>', methods=['GET'])
@jwt_required()
def get_application(application_id):
    """Get application details."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    application = SchemeApplication.query.get(application_id)
    if not application:
        return jsonify({'error': 'Application not found'}), 404
    
    # Check permission
    if user.role == 'student':
        student = Student.query.filter_by(user_id=user_id).first()
        if not student or application.student_id != student.id:
            return jsonify({'error': 'Access denied'}), 403
    
    return jsonify({'application': application.to_dict()}), 200


@scheme_bp.route('/applications/<int:application_id>/review', methods=['POST'])
@jwt_required()
@role_required(['ministry'])
@validate_json(['status'])
def review_application(application_id):
    """Review scheme application."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    application = SchemeApplication.query.get(application_id)
    if not application:
        return jsonify({'error': 'Application not found'}), 404
    
    data = request.get_json()
    
    application.status = data['status']
    application.reviewer_comments = data.get('reviewer_comments')
    application.reviewed_by = user.full_name
    application.review_date = datetime.utcnow()
    
    if data.get('approved_amount'):
        application.approved_amount = data['approved_amount']
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Application reviewed successfully',
            'application': application.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
