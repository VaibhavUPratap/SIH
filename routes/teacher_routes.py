from flask import Blueprint, request, jsonify, render_template
from models.user import User, db
from models.teacher import Teacher
from models.student import Student
from utils.helpers import role_required, json_to_text, text_to_json
from flask_jwt_extended import jwt_required, current_user

teacher_bp = Blueprint('teacher', __name__)

@teacher_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@role_required(['teacher'])
def dashboard():
    return render_template('dashboard_teacher.html')

@teacher_bp.route('/evaluate_student', methods=['POST'])
@jwt_required()
@role_required(['teacher'])
def evaluate_student():
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        evaluation_data = data.get('evaluation')
        
        student = Student.query.get(student_id)
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        teacher = current_user.teacher_profile
        evaluations = text_to_json(teacher.evaluations) or []
        
        evaluations.append({
            'student_id': student_id,
            'student_name': student.user.name,
            'evaluation': evaluation_data,
            'date': data.get('date'),
            'score': data.get('score')
        })
        
        teacher.evaluations = json_to_text(evaluations)
        
        # Update student's academic progress
        if data.get('update_progress'):
            student.academic_progress = data.get('progress', student.academic_progress)
        
        db.session.commit()
        
        return jsonify({'message': 'Evaluation submitted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@teacher_bp.route('/performance', methods=['GET'])
@jwt_required()
@role_required(['teacher'])
def get_performance():
    try:
        teacher = current_user.teacher_profile
        
        if not teacher:
            return jsonify({'error': 'Teacher profile not found'}), 404
        
        performance_data = {
            'evaluations_count': len(text_to_json(teacher.evaluations) or []),
            'subject': teacher.subject,
            'department': teacher.department
        }
        
        return jsonify(performance_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500