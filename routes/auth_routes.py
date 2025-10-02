from flask import Blueprint, request, jsonify
from models.user import User, db
from utils.helpers import role_required
from flask_jwt_extended import jwt_required, get_jwt_identity, current_user

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Check if user already exists
        if User.query.filter_by(email=data.get('email')).first():
            return jsonify({'error': 'User already exists'}), 400
        
        # Create new user
        user = User(
            name=data.get('name'),
            email=data.get('email'),
            role=data.get('role'),
            aadhaar_id=data.get('aadhaar_id')
        )
        user.set_password(data.get('password'))
        
        db.session.add(user)
        db.session.commit()
        
        # Create role-specific profile
        from models.student import Student
        from models.teacher import Teacher
        from models.institution import Institution
        
        if user.role == 'student':
            student = Student(
                id=user.id,
                user_id=user.id,
                enrollment_no=data.get('enrollment_no'),
                courses='[]',
                projects='[]'
            )
            db.session.add(student)
        elif user.role == 'teacher':
            teacher = Teacher(
                id=user.id,
                user_id=user.id,
                apar_id=data.get('apar_id'),
                subject=data.get('subject'),
                evaluations='[]'
            )
            db.session.add(teacher)
        elif user.role == 'institution':
            institution = Institution(
                id=user.id,
                user_id=user.id,
                aishe_code=data.get('aishe_code'),
                institution_name=data.get('institution_name'),
                schemes='[]'
            )
            db.session.add(institution)
        
        db.session.commit()
        
        token = user.generate_token()
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        token = user.generate_token()
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        # FIXED: Use current_user from jwt instead of get_jwt_identity()
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        profile_data = user.to_dict()
        
        # Add role-specific data
        if user.role == 'student' and user.student_profile:
            profile_data.update(user.student_profile.to_dict())
        elif user.role == 'teacher' and user.teacher_profile:
            profile_data.update(user.teacher_profile.to_dict())
        elif user.role == 'institution' and user.institution_profile:
            profile_data.update(user.institution_profile.to_dict())
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500