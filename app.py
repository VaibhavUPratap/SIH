"""
Main Flask application for Unified Education Interface (UEI).
Handles initialization, configuration, and route registration.
"""
from flask import Flask, jsonify, render_template
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import get_config
from models import db, init_db
import os
import logging
from logging.handlers import RotatingFileHandler


def create_app(config_name=None):
    """Application factory for creating Flask app instance."""
    
    app = Flask(__name__)
    
    # Load configuration
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app.config.from_object(get_config())
    
    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": app.config['CORS_ORIGINS']}})
    
    # Setup logging
    setup_logging(app)
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    # Register blueprints (routes)
    register_blueprints(app)
    
    # Register error handlers
    register_error_handlers(app)
    
    # Register JWT handlers
    register_jwt_handlers(jwt)
    
    # Register CLI commands
    register_cli_commands(app)
    
    return app


def setup_logging(app):
    """Setup application logging."""
    if not app.debug:
        # Create logs directory if it doesn't exist
        if not os.path.exists('logs'):
            os.mkdir('logs')
        
        # Setup file handler
        file_handler = RotatingFileHandler(
            app.config.get('LOG_FILE', 'logs/uei.log'),
            maxBytes=10240000,
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('UEI application startup')


def register_blueprints(app):
    """Register all application blueprints."""
    from routes.auth import auth_bp
    from routes.student import student_bp
    from routes.teacher import teacher_bp
    from routes.institution import institution_bp
    from routes.scheme import scheme_bp
    from routes.analytics import analytics_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(student_bp, url_prefix='/api/students')
    app.register_blueprint(teacher_bp, url_prefix='/api/teachers')
    app.register_blueprint(institution_bp, url_prefix='/api/institutions')
    app.register_blueprint(scheme_bp, url_prefix='/api/schemes')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    
    # Main routes
    @app.route('/')
    def index():
        """Home page."""
        return render_template('index.html', app_name=app.config['APP_NAME'])
    
    @app.route('/health')
    def health():
        """Health check endpoint."""
        return jsonify({'status': 'healthy', 'service': 'UEI'}), 200


def register_error_handlers(app):
    """Register error handlers."""
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad request'}), 400
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({'error': 'Forbidden'}), 403
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({'error': 'Unauthorized'}), 401


def register_jwt_handlers(jwt):
    """Register JWT event handlers."""
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has expired'}), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'error': 'Invalid token'}), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'error': 'Authorization token required'}), 401


def register_cli_commands(app):
    """Register custom CLI commands."""
    
    @app.cli.command()
    def init_db_cli():
        """Initialize the database."""
        with app.app_context():
            db.create_all()
            print("Database initialized successfully!")
    
    @app.cli.command()
    def seed_db():
        """Seed the database with sample data."""
        from utils.seed_data import seed_database
        with app.app_context():
            seed_database()
            print("Database seeded successfully!")


if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=app.config['DEBUG'])
