from flask import Blueprint, request, jsonify, render_template
from models.user import User, db
from models.institution import Institution
from models.student import Student
from models.teacher import Teacher
from utils.helpers import role_required, json_to_text, text_to_json
from flask_jwt_extended import jwt_required, current_user

institution_bp = Blueprint('institution', __name__)

@institution_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@role_required(['institution'])
def dashboard():
    return render_template('dashboard_institution.html')

@institution_bp.route('/upload_data', methods=['POST'])
@jwt_required()
@role_required(['institution'])
def upload_data():
    try:
        data = request.get_json()
        
        institution = current_user.institution_profile
        if not institution:
            return jsonify({'error': 'Institution profile not found'}), 404
        
        # Update NIRF rank and schemes
        if 'nirf_rank' in data:
            institution.nirf_rank = data.get('nirf_rank')
        
        if 'schemes' in data:
            schemes = text_to_json(institution.schemes) or []
            schemes.extend(data.get('schemes', []))
            institution.schemes = json_to_text(schemes)
        
        db.session.commit()
        
        return jsonify({'message': 'Data uploaded successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@institution_bp.route('/analytics', methods=['GET'])
@jwt_required()
@role_required(['institution'])
def get_analytics():
    try:
        # Get institution statistics
        total_students = Student.query.count()
        total_teachers = Teacher.query.count()
        
        institution = current_user.institution_profile
        
        analytics_data = {
            'total_students': total_students,
            'total_teachers': total_teachers,
            'nirf_rank': institution.nirf_rank,
            'schemes': text_to_json(institution.schemes),
            'institution_name': institution.institution_name
        }
        
        return jsonify(analytics_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500