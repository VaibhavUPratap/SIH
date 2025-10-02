from dotenv import load_dotenv
load_dotenv()

import os
from flask import Flask, render_template, jsonify
from flask_jwt_extended import JWTManager, get_jwt_identity, jwt_required
from flask_migrate import Migrate
from config import config
from models.user import db, User

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    migrate = Migrate(app, db)
    
    # JWT configuration - FIXED VERSION
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        # This should return a simple identity (user ID)
        return user.id

    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        # This gets the user object from the identity
        identity = jwt_data["sub"]
        return User.query.get(identity)
    
    # Register blueprints
    from routes.auth_routes import auth_bp
    from routes.student_routes import student_bp
    from routes.teacher_routes import teacher_bp
    from routes.institution_routes import institution_bp
    from routes.admin_routes import admin_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(student_bp, url_prefix='/student')
    app.register_blueprint(teacher_bp, url_prefix='/teacher')
    app.register_blueprint(institution_bp, url_prefix='/institution')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    
    # Routes
    @app.route('/')
    def index():
        return render_template('login.html')
    
    @app.route('/login')
    def login_page():
        return render_template('login.html')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

if __name__ == '__main__':
    app = create_app(os.getenv('FLASK_ENV', 'default'))
    
    with app.app_context():
        db.create_all()
    
    app.run(debug=True, port=5000)