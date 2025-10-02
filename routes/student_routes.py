from flask import Blueprint, request, jsonify, render_template
from models.user import User, db
from models.student import Student
from utils.helpers import role_required, json_to_text, text_to_json
from flask_jwt_extended import jwt_required, get_jwt_identity

student_bp = Blueprint('student', __name__)

@student_bp.route('/dashboard', methods=['GET'])
def dashboard():
    # Template route - authentication handled by JavaScript
    return render_template('dashboard_student.html')

@student_bp.route('/upload_project', methods=['POST'])
@jwt_required()
@role_required(['student'])
def upload_project():
    try:
        data = request.get_json()
        
        current_user_id = get_jwt_identity()
        current_user_obj = User.query.get(current_user_id)
        student = current_user_obj.student_profile
        if not student:
            return jsonify({'error': 'Student profile not found'}), 404
        
        projects = text_to_json(student.projects) or []
        projects.append({
            'title': data.get('title'),
            'description': data.get('description'),
            'technology': data.get('technology'),
            'github_link': data.get('github_link'),
            'upload_date': data.get('upload_date')
        })
        
        student.projects = json_to_text(projects)
        db.session.commit()
        
        return jsonify({'message': 'Project uploaded successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@student_bp.route('/performance', methods=['GET'])
@jwt_required()
@role_required(['student'])
def get_performance():
    try:
        current_user_id = get_jwt_identity()
        current_user_obj = User.query.get(current_user_id)
        student = current_user_obj.student_profile
        
        if not student:
            return jsonify({'error': 'Student profile not found'}), 404
        
        performance_data = {
            'academic_progress': student.academic_progress,
            'courses': text_to_json(student.courses),
            'projects': text_to_json(student.projects)
        }
        
        return jsonify(performance_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500