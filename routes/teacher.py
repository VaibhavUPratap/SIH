"""
Teacher routes for managing teacher profiles, APAR, and contributions.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.user import User
from models.teacher import Teacher, APARRecord, AcademicContribution
from utils.decorators import role_required, validate_json

teacher_bp = Blueprint('teacher', __name__)


@teacher_bp.route('', methods=['GET'])
@jwt_required()
@role_required(['institution', 'ministry'])
def list_teachers():
    """List all teachers."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    teachers = Teacher.query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'teachers': [t.to_dict() for t in teachers.items],
        'total': teachers.total,
        'pages': teachers.pages,
        'current_page': teachers.page
    }), 200


@teacher_bp.route('/<int:teacher_id>', methods=['GET'])
@jwt_required()
def get_teacher(teacher_id):
    """Get teacher details."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    teacher = Teacher.query.get(teacher_id)
    if not teacher:
        return jsonify({'error': 'Teacher not found'}), 404
    
    # Check permission
    if user.role not in ['institution', 'ministry'] and teacher.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify({'teacher': teacher.to_dict()}), 200


@teacher_bp.route('', methods=['POST'])
@jwt_required()
@role_required(['teacher', 'institution'])
@validate_json(['employee_id', 'designation', 'department', 'date_of_joining'])
def create_teacher():
    """Create teacher profile."""
    user_id = get_jwt_identity()
    
    # Check if teacher profile already exists
    if Teacher.query.filter_by(user_id=user_id).first():
        return jsonify({'error': 'Teacher profile already exists'}), 400
    
    data = request.get_json()
    
    # Check for duplicate employee ID
    if Teacher.query.filter_by(employee_id=data['employee_id']).first():
        return jsonify({'error': 'Employee ID already exists'}), 400
    
    teacher = Teacher(
        user_id=user_id,
        employee_id=data['employee_id'],
        institution_id=data.get('institution_id'),
        designation=data['designation'],
        department=data['department'],
        specialization=data.get('specialization'),
        highest_qualification=data.get('highest_qualification'),
        qualification_year=data.get('qualification_year'),
        university=data.get('university'),
        date_of_joining=data['date_of_joining'],
        employment_type=data.get('employment_type'),
        office_address=data.get('office_address'),
        office_phone=data.get('office_phone')
    )
    
    try:
        db.session.add(teacher)
        db.session.commit()
        return jsonify({
            'message': 'Teacher profile created successfully',
            'teacher': teacher.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@teacher_bp.route('/<int:teacher_id>', methods=['PUT'])
@jwt_required()
def update_teacher(teacher_id):
    """Update teacher profile."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    teacher = Teacher.query.get(teacher_id)
    if not teacher:
        return jsonify({'error': 'Teacher not found'}), 404
    
    # Check permission
    if user.role not in ['institution', 'ministry'] and teacher.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    # Update fields
    allowed_fields = [
        'designation', 'department', 'specialization',
        'office_address', 'office_phone', 'employment_type'
    ]
    
    for field in allowed_fields:
        if field in data:
            setattr(teacher, field, data[field])
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Teacher profile updated successfully',
            'teacher': teacher.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@teacher_bp.route('/<int:teacher_id>/apar', methods=['POST'])
@jwt_required()
@validate_json(['year', 'assessment_period'])
def submit_apar(teacher_id):
    """Submit APAR record."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    teacher = Teacher.query.get(teacher_id)
    if not teacher:
        return jsonify({'error': 'Teacher not found'}), 404
    
    # Check permission
    if teacher.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    apar = APARRecord(
        teacher_id=teacher_id,
        year=data['year'],
        assessment_period=data['assessment_period'],
        teaching_score=data.get('teaching_score'),
        research_score=data.get('research_score'),
        administrative_score=data.get('administrative_score'),
        overall_score=data.get('overall_score'),
        grade=data.get('grade'),
        courses_taught=data.get('courses_taught', 0),
        students_guided=data.get('students_guided', 0),
        publications=data.get('publications', 0),
        conferences_attended=data.get('conferences_attended', 0),
        self_assessment=data.get('self_assessment')
    )
    
    try:
        db.session.add(apar)
        db.session.commit()
        return jsonify({
            'message': 'APAR submitted successfully',
            'apar': apar.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@teacher_bp.route('/<int:teacher_id>/contributions', methods=['GET'])
@jwt_required()
def get_contributions(teacher_id):
    """Get teacher's academic contributions."""
    teacher = Teacher.query.get(teacher_id)
    if not teacher:
        return jsonify({'error': 'Teacher not found'}), 404
    
    contributions = AcademicContribution.query.filter_by(teacher_id=teacher_id).order_by(
        AcademicContribution.year.desc()
    ).all()
    
    return jsonify({
        'teacher_id': teacher_id,
        'contributions': [c.to_dict() for c in contributions]
    }), 200


@teacher_bp.route('/<int:teacher_id>/contributions', methods=['POST'])
@jwt_required()
@validate_json(['contribution_type', 'title'])
def add_contribution(teacher_id):
    """Add academic contribution."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    teacher = Teacher.query.get(teacher_id)
    if not teacher:
        return jsonify({'error': 'Teacher not found'}), 404
    
    # Check permission
    if teacher.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    contribution = AcademicContribution(
        teacher_id=teacher_id,
        contribution_type=data['contribution_type'],
        title=data['title'],
        description=data.get('description'),
        year=data.get('year'),
        journal_name=data.get('journal_name'),
        doi=data.get('doi'),
        citations=data.get('citations', 0),
        impact_factor=data.get('impact_factor'),
        funding_agency=data.get('funding_agency'),
        project_amount=data.get('project_amount'),
        project_status=data.get('project_status'),
        co_authors=data.get('co_authors')
    )
    
    try:
        db.session.add(contribution)
        db.session.commit()
        return jsonify({
            'message': 'Contribution added successfully',
            'contribution': contribution.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
