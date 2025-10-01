"""
Student routes for managing student profiles and performance.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.user import User
from models.student import Student, StudentPerformance
from utils.decorators import role_required, validate_json

student_bp = Blueprint('student', __name__)


@student_bp.route('', methods=['GET'])
@jwt_required()
@role_required(['institution', 'ministry'])
def list_students():
    """List all students (admin/institution only)."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    students = Student.query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'students': [s.to_dict() for s in students.items],
        'total': students.total,
        'pages': students.pages,
        'current_page': students.page
    }), 200


@student_bp.route('/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student(student_id):
    """Get student details."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    student = Student.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    # Check permission
    if user.role not in ['institution', 'ministry'] and student.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify({'student': student.to_dict()}), 200


@student_bp.route('', methods=['POST'])
@jwt_required()
@role_required(['student', 'institution'])
@validate_json(['enrollment_number', 'program', 'enrollment_date'])
def create_student():
    """Create student profile."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    # Check if student profile already exists
    if Student.query.filter_by(user_id=user_id).first():
        return jsonify({'error': 'Student profile already exists'}), 400
    
    data = request.get_json()
    
    # Check for duplicate enrollment number
    if Student.query.filter_by(enrollment_number=data['enrollment_number']).first():
        return jsonify({'error': 'Enrollment number already exists'}), 400
    
    student = Student(
        user_id=user_id,
        enrollment_number=data['enrollment_number'],
        aishe_code=data.get('aishe_code'),
        institution_id=data.get('institution_id'),
        program=data['program'],
        specialization=data.get('specialization'),
        year_of_study=data.get('year_of_study'),
        semester=data.get('semester'),
        enrollment_date=data['enrollment_date'],
        expected_graduation_date=data.get('expected_graduation_date'),
        father_name=data.get('father_name'),
        mother_name=data.get('mother_name'),
        category=data.get('category'),
        gender=data.get('gender'),
        address=data.get('address'),
        city=data.get('city'),
        state=data.get('state'),
        pincode=data.get('pincode'),
        annual_family_income=data.get('annual_family_income')
    )
    
    try:
        db.session.add(student)
        db.session.commit()
        return jsonify({
            'message': 'Student profile created successfully',
            'student': student.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@student_bp.route('/<int:student_id>', methods=['PUT'])
@jwt_required()
def update_student(student_id):
    """Update student profile."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    student = Student.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    # Check permission
    if user.role not in ['institution', 'ministry'] and student.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    # Update fields
    allowed_fields = [
        'specialization', 'year_of_study', 'semester', 'cgpa',
        'percentage', 'current_status', 'address', 'city',
        'state', 'pincode', 'annual_family_income'
    ]
    
    for field in allowed_fields:
        if field in data:
            setattr(student, field, data[field])
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Student profile updated successfully',
            'student': student.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@student_bp.route('/<int:student_id>/performance', methods=['GET'])
@jwt_required()
def get_student_performance(student_id):
    """Get student performance metrics."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    student = Student.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    # Check permission
    if user.role not in ['institution', 'ministry'] and student.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    performances = StudentPerformance.query.filter_by(student_id=student_id).order_by(
        StudentPerformance.academic_year.desc(),
        StudentPerformance.semester.desc()
    ).all()
    
    return jsonify({
        'student_id': student_id,
        'performances': [p.to_dict() for p in performances]
    }), 200


@student_bp.route('/<int:student_id>/performance', methods=['POST'])
@jwt_required()
@role_required(['institution', 'ministry'])
@validate_json(['academic_year', 'semester'])
def add_performance(student_id):
    """Add student performance record."""
    student = Student.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    data = request.get_json()
    
    performance = StudentPerformance(
        student_id=student_id,
        academic_year=data['academic_year'],
        semester=data['semester'],
        sgpa=data.get('sgpa'),
        cgpa=data.get('cgpa'),
        percentage=data.get('percentage'),
        credits_earned=data.get('credits_earned'),
        rank=data.get('rank'),
        awards=data.get('awards'),
        attendance_percentage=data.get('attendance_percentage'),
        remarks=data.get('remarks')
    )
    
    try:
        db.session.add(performance)
        db.session.commit()
        return jsonify({
            'message': 'Performance record added successfully',
            'performance': performance.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@student_bp.route('/<int:student_id>/schemes', methods=['GET'])
@jwt_required()
def get_eligible_schemes(student_id):
    """Get eligible schemes for student."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    student = Student.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    # Check permission
    if user.role not in ['institution', 'ministry'] and student.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    # TODO: Implement eligibility logic based on student profile
    from models.scheme import Scheme
    schemes = Scheme.query.filter_by(is_active=True, target_group='student').all()
    
    return jsonify({
        'student_id': student_id,
        'eligible_schemes': [s.to_dict() for s in schemes]
    }), 200
