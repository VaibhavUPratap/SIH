import json
from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models.user import User

def role_required(roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                verify_jwt_in_request()
                current_user_id = get_jwt_identity()
                current_user = User.query.get(current_user_id)
                
                if not current_user or current_user.role not in roles:
                    return jsonify({'error': 'Insufficient permissions'}), 403
                return f(*args, **kwargs)
            except Exception as e:
                return jsonify({'error': 'Invalid token'}), 401
        return decorated_function
    return decorator

def json_to_text(data):
    """Convert JSON data to text for database storage"""
    if isinstance(data, (dict, list)):
        return json.dumps(data)
    return data

def text_to_json(data):
    """Convert text data from database to JSON"""
    if data:
        try:
            return json.loads(data)
        except:
            return data
    return None