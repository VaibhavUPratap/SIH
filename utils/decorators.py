"""
Custom decorators for request validation and authorization.
"""
from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from models.user import User


def validate_json(required_fields):
    """
    Decorator to validate JSON request body.
    
    Args:
        required_fields (list): List of required field names
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                return jsonify({'error': 'Content-Type must be application/json'}), 400
            
            data = request.get_json()
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                return jsonify({
                    'error': 'Missing required fields',
                    'missing_fields': missing_fields
                }), 400
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def role_required(allowed_roles):
    """
    Decorator to check if user has required role.
    
    Args:
        allowed_roles (list): List of allowed roles
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            if user.role not in allowed_roles:
                return jsonify({
                    'error': 'Access denied',
                    'required_roles': allowed_roles,
                    'your_role': user.role
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def paginate_query(query, page=1, per_page=20):
    """
    Helper function to paginate SQLAlchemy queries.
    
    Args:
        query: SQLAlchemy query object
        page (int): Page number
        per_page (int): Items per page
        
    Returns:
        dict: Paginated results
    """
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return {
        'items': paginated.items,
        'total': paginated.total,
        'pages': paginated.pages,
        'current_page': paginated.page,
        'has_next': paginated.has_next,
        'has_prev': paginated.has_prev
    }
