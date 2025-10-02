from flask import Blueprint, request, jsonify, render_template
from models.user import User, db
from models.student import Student
from models.teacher import Teacher
from models.institution import Institution
from utils.helpers import role_required
from flask_jwt_extended import jwt_required, get_jwt_identity

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
def dashboard():
    # Template route - authentication handled by JavaScript
    return render_template('dashboard_admin.html')

@admin_bp.route('/manage_users', methods=['POST'])
@jwt_required()
@role_required(['admin'])
def manage_users():
    try:
        data = request.get_json()
        action = data.get('action')
        user_id = data.get('user_id')
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if action == 'delete':
            db.session.delete(user)
            db.session.commit()
            return jsonify({'message': 'User deleted successfully'}), 200
        elif action == 'update_role':
            new_role = data.get('role')
            user.role = new_role
            db.session.commit()
            return jsonify({'message': 'User role updated successfully'}), 200
        else:
            return jsonify({'error': 'Invalid action'}), 400
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/reports', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def get_reports():
    try:
        from services.report_service import ReportService
        from services.analytics_service import AnalyticsService
        
        # Get comprehensive system analytics
        system_overview = AnalyticsService.get_system_overview()
        student_trends = AnalyticsService.get_student_performance_trends()
        institution_rankings = AnalyticsService.get_institution_rankings()
        teacher_stats = AnalyticsService.get_teacher_evaluation_stats()
        
        reports_data = {
            **system_overview,
            'student_performance_trends': student_trends,
            'institution_rankings': institution_rankings,
            'teacher_evaluation_stats': teacher_stats
        }
        
        return jsonify(reports_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/analytics', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def get_analytics():
    try:
        from services.report_service import ReportService
        
        report = ReportService.generate_admin_report()
        return jsonify(report), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
