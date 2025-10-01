"""
Analytics routes for generating insights and reports.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.user import User
from models.student import Student, StudentPerformance
from models.teacher import Teacher
from models.institution import Institution, NIRFData
from models.scheme import SchemeApplication
from utils.decorators import role_required
from sqlalchemy import func

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    """Get dashboard metrics based on user role."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.role == 'student':
        return get_student_dashboard(user_id)
    elif user.role == 'teacher':
        return get_teacher_dashboard(user_id)
    elif user.role == 'institution':
        return get_institution_dashboard(user_id)
    elif user.role == 'ministry':
        return get_ministry_dashboard()
    
    return jsonify({'error': 'Invalid role'}), 400


def get_student_dashboard(user_id):
    """Get student-specific dashboard."""
    student = Student.query.filter_by(user_id=user_id).first()
    
    if not student:
        return jsonify({'error': 'Student profile not found'}), 404
    
    # Performance data
    latest_performance = StudentPerformance.query.filter_by(
        student_id=student.id
    ).order_by(StudentPerformance.created_at.desc()).first()
    
    # Scheme applications
    applications = SchemeApplication.query.filter_by(student_id=student.id).all()
    
    return jsonify({
        'student': student.to_dict(),
        'latest_performance': latest_performance.to_dict() if latest_performance else None,
        'total_applications': len(applications),
        'approved_applications': len([a for a in applications if a.status == 'approved']),
        'pending_applications': len([a for a in applications if a.status == 'submitted'])
    }), 200


def get_teacher_dashboard(user_id):
    """Get teacher-specific dashboard."""
    teacher = Teacher.query.filter_by(user_id=user_id).first()
    
    if not teacher:
        return jsonify({'error': 'Teacher profile not found'}), 404
    
    return jsonify({
        'teacher': teacher.to_dict(),
        'total_publications': teacher.total_publications,
        'total_citations': teacher.total_citations,
        'h_index': teacher.h_index
    }), 200


def get_institution_dashboard(user_id):
    """Get institution-specific dashboard."""
    institution = Institution.query.filter_by(user_id=user_id).first()
    
    if not institution:
        return jsonify({'error': 'Institution profile not found'}), 404
    
    # Latest NIRF data
    latest_nirf = NIRFData.query.filter_by(
        institution_id=institution.id
    ).order_by(NIRFData.year.desc()).first()
    
    return jsonify({
        'institution': institution.to_dict(),
        'latest_nirf': latest_nirf.to_dict() if latest_nirf else None,
        'total_students': institution.total_students,
        'total_faculty': institution.total_faculty
    }), 200


def get_ministry_dashboard():
    """Get ministry-level dashboard with aggregated statistics."""
    total_students = Student.query.count()
    total_teachers = Teacher.query.count()
    total_institutions = Institution.query.count()
    total_applications = SchemeApplication.query.count()
    
    # Applications by status
    applications_by_status = db.session.query(
        SchemeApplication.status,
        func.count(SchemeApplication.id)
    ).group_by(SchemeApplication.status).all()
    
    # Top institutions by NIRF rank
    top_institutions = db.session.query(Institution).join(
        NIRFData, Institution.id == NIRFData.institution_id
    ).filter(
        NIRFData.overall_rank.isnot(None)
    ).order_by(NIRFData.overall_rank.asc()).limit(10).all()
    
    return jsonify({
        'total_students': total_students,
        'total_teachers': total_teachers,
        'total_institutions': total_institutions,
        'total_applications': total_applications,
        'applications_by_status': dict(applications_by_status),
        'top_institutions': [i.to_dict() for i in top_institutions]
    }), 200


@analytics_bp.route('/trends', methods=['GET'])
@jwt_required()
@role_required(['ministry', 'institution'])
def get_trends():
    """Get performance trends."""
    metric = request.args.get('metric', 'enrollment')
    
    if metric == 'enrollment':
        # Students enrolled per year
        trends = db.session.query(
            func.strftime('%Y', Student.enrollment_date).label('year'),
            func.count(Student.id).label('count')
        ).group_by('year').order_by('year').all()
        
        return jsonify({
            'metric': 'enrollment',
            'trends': [{'year': t[0], 'count': t[1]} for t in trends]
        }), 200
    
    return jsonify({'error': 'Invalid metric'}), 400


@analytics_bp.route('/reports/<report_type>', methods=['GET'])
@jwt_required()
@role_required(['ministry', 'institution'])
def generate_report(report_type):
    """Generate various types of reports."""
    
    if report_type == 'students':
        students = Student.query.all()
        return jsonify({
            'report_type': 'students',
            'total': len(students),
            'data': [s.to_dict() for s in students]
        }), 200
    
    elif report_type == 'institutions':
        institutions = Institution.query.all()
        return jsonify({
            'report_type': 'institutions',
            'total': len(institutions),
            'data': [i.to_dict() for i in institutions]
        }), 200
    
    elif report_type == 'schemes':
        applications = SchemeApplication.query.all()
        return jsonify({
            'report_type': 'schemes',
            'total': len(applications),
            'data': [a.to_dict() for a in applications]
        }), 200
    
    return jsonify({'error': 'Invalid report type'}), 400


@analytics_bp.route('/predict', methods=['POST'])
@jwt_required()
@role_required(['ministry', 'institution'])
def predict():
    """Run prediction models (placeholder for ML integration)."""
    data = request.get_json()
    prediction_type = data.get('type', 'performance')
    
    # Placeholder for ML model integration
    return jsonify({
        'message': 'Prediction model not implemented yet',
        'type': prediction_type,
        'note': 'Integrate scikit-learn models here for actual predictions'
    }), 200
