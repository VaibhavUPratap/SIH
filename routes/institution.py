"""
Institution routes for managing institutions, NIRF data, and compliance.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.user import User
from models.institution import Institution, NIRFData, ComplianceRecord
from utils.decorators import role_required, validate_json

institution_bp = Blueprint('institution', __name__)


@institution_bp.route('', methods=['GET'])
@jwt_required()
def list_institutions():
    """List all institutions."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    institutions = Institution.query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'institutions': [i.to_dict() for i in institutions.items],
        'total': institutions.total,
        'pages': institutions.pages,
        'current_page': institutions.page
    }), 200


@institution_bp.route('/<int:institution_id>', methods=['GET'])
@jwt_required()
def get_institution(institution_id):
    """Get institution details."""
    institution = Institution.query.get(institution_id)
    if not institution:
        return jsonify({'error': 'Institution not found'}), 404
    
    return jsonify({'institution': institution.to_dict()}), 200


@institution_bp.route('', methods=['POST'])
@jwt_required()
@role_required(['institution', 'ministry'])
@validate_json(['institution_name', 'institution_code', 'institution_type', 'city', 'state'])
def create_institution():
    """Register a new institution."""
    user_id = get_jwt_identity()
    
    # Check if institution profile already exists
    if Institution.query.filter_by(user_id=user_id).first():
        return jsonify({'error': 'Institution profile already exists'}), 400
    
    data = request.get_json()
    
    # Check for duplicate institution code
    if Institution.query.filter_by(institution_code=data['institution_code']).first():
        return jsonify({'error': 'Institution code already exists'}), 400
    
    institution = Institution(
        user_id=user_id,
        institution_name=data['institution_name'],
        institution_code=data['institution_code'],
        aishe_code=data.get('aishe_code'),
        institution_type=data['institution_type'],
        category=data.get('category'),
        address=data.get('address'),
        city=data['city'],
        state=data['state'],
        pincode=data.get('pincode'),
        phone_number=data.get('phone_number'),
        email=data.get('email'),
        website=data.get('website'),
        year_of_establishment=data.get('year_of_establishment'),
        campus_area=data.get('campus_area')
    )
    
    try:
        db.session.add(institution)
        db.session.commit()
        return jsonify({
            'message': 'Institution registered successfully',
            'institution': institution.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@institution_bp.route('/<int:institution_id>', methods=['PUT'])
@jwt_required()
def update_institution(institution_id):
    """Update institution details."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    institution = Institution.query.get(institution_id)
    if not institution:
        return jsonify({'error': 'Institution not found'}), 404
    
    # Check permission
    if user.role != 'ministry' and institution.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    # Update fields
    allowed_fields = [
        'address', 'phone_number', 'email', 'website',
        'total_students', 'total_faculty', 'total_programs',
        'campus_area', 'naac_grade', 'naac_score'
    ]
    
    for field in allowed_fields:
        if field in data:
            setattr(institution, field, data[field])
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Institution updated successfully',
            'institution': institution.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@institution_bp.route('/<int:institution_id>/nirf', methods=['GET'])
@jwt_required()
def get_nirf_data(institution_id):
    """Get NIRF data for institution."""
    institution = Institution.query.get(institution_id)
    if not institution:
        return jsonify({'error': 'Institution not found'}), 404
    
    nirf_data = NIRFData.query.filter_by(institution_id=institution_id).order_by(
        NIRFData.year.desc()
    ).all()
    
    return jsonify({
        'institution_id': institution_id,
        'nirf_data': [n.to_dict() for n in nirf_data]
    }), 200


@institution_bp.route('/<int:institution_id>/nirf', methods=['POST'])
@jwt_required()
@role_required(['institution', 'ministry'])
@validate_json(['year', 'category'])
def add_nirf_data(institution_id):
    """Add NIRF data for institution."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    institution = Institution.query.get(institution_id)
    if not institution:
        return jsonify({'error': 'Institution not found'}), 404
    
    # Check permission
    if user.role != 'ministry' and institution.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    nirf = NIRFData(
        institution_id=institution_id,
        year=data['year'],
        overall_rank=data.get('overall_rank'),
        category=data['category'],
        category_rank=data.get('category_rank'),
        teaching_learning_resources=data.get('teaching_learning_resources'),
        research_professional_practice=data.get('research_professional_practice'),
        graduation_outcomes=data.get('graduation_outcomes'),
        outreach_inclusivity=data.get('outreach_inclusivity'),
        perception=data.get('perception'),
        total_score=data.get('total_score'),
        student_strength=data.get('student_strength'),
        faculty_strength=data.get('faculty_strength'),
        phd_faculty_ratio=data.get('phd_faculty_ratio')
    )
    
    try:
        db.session.add(nirf)
        db.session.commit()
        return jsonify({
            'message': 'NIRF data added successfully',
            'nirf_data': nirf.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@institution_bp.route('/<int:institution_id>/compliance', methods=['GET'])
@jwt_required()
def get_compliance_records(institution_id):
    """Get compliance records for institution."""
    institution = Institution.query.get(institution_id)
    if not institution:
        return jsonify({'error': 'Institution not found'}), 404
    
    records = ComplianceRecord.query.filter_by(institution_id=institution_id).order_by(
        ComplianceRecord.year.desc()
    ).all()
    
    return jsonify({
        'institution_id': institution_id,
        'compliance_records': [r.to_dict() for r in records]
    }), 200


@institution_bp.route('/<int:institution_id>/compliance', methods=['POST'])
@jwt_required()
@role_required(['institution', 'ministry'])
@validate_json(['compliance_type', 'year', 'requirement', 'status'])
def add_compliance_record(institution_id):
    """Add compliance record."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    institution = Institution.query.get(institution_id)
    if not institution:
        return jsonify({'error': 'Institution not found'}), 404
    
    # Check permission
    if user.role != 'ministry' and institution.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    record = ComplianceRecord(
        institution_id=institution_id,
        compliance_type=data['compliance_type'],
        year=data['year'],
        requirement=data['requirement'],
        status=data['status'],
        document_url=data.get('document_url'),
        remarks=data.get('remarks')
    )
    
    try:
        db.session.add(record)
        db.session.commit()
        return jsonify({
            'message': 'Compliance record added successfully',
            'record': record.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
