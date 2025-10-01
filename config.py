"""
Configuration module for UEI application.
Manages environment-specific settings and configurations.
"""
import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration class with common settings."""
    
    # Flask Core Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'sqlite:///uei.db'  # Fallback to SQLite for development
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    
    # MongoDB Configuration
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/uei_db')
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))
    )
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES', 2592000))
    )
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    
    # Aadhaar Mock API Configuration
    AADHAAR_API_URL = os.getenv('AADHAAR_API_URL', 'https://mock-aadhaar-api.example.com')
    AADHAAR_API_KEY = os.getenv('AADHAAR_API_KEY', 'mock-api-key')
    
    # MFA Configuration
    MFA_ISSUER_NAME = os.getenv('MFA_ISSUER_NAME', 'UEI-Platform')
    MFA_ENABLED = os.getenv('MFA_ENABLED', 'True').lower() == 'true'
    
    # Email Configuration
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', '')
    
    # Application Configuration
    APP_NAME = os.getenv('APP_NAME', 'Unified Education Interface')
    APP_URL = os.getenv('APP_URL', 'http://localhost:5000')
    PAGINATION_PER_PAGE = int(os.getenv('PAGINATION_PER_PAGE', 20))
    
    # File Upload Configuration
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB
    ALLOWED_EXTENSIONS = set(
        os.getenv('ALLOWED_EXTENSIONS', 'pdf,doc,docx,jpg,jpeg,png').split(',')
    )
    
    # Analytics Configuration
    ENABLE_ANALYTICS = os.getenv('ENABLE_ANALYTICS', 'True').lower() == 'true'
    ML_MODEL_PATH = os.getenv('ML_MODEL_PATH', 'models/ml_models')
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'logs/uei.log')
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5000').split(',')
    
    # Rate Limiting
    RATE_LIMIT_ENABLED = os.getenv('RATE_LIMIT_ENABLED', 'True').lower() == 'true'
    RATE_LIMIT_DEFAULT = os.getenv('RATE_LIMIT_DEFAULT', '100/hour')
    
    # Data Sources (for integration)
    DATA_SOURCES = {
        'AISHE': {
            'url': 'https://aishe.gov.in/api',
            'api_key': os.getenv('AISHE_API_KEY', ''),
        },
        'NIRF': {
            'url': 'https://www.nirfindia.org/api',
            'api_key': os.getenv('NIRF_API_KEY', ''),
        },
        'UGC': {
            'url': 'https://www.ugc.ac.in/api',
            'api_key': os.getenv('UGC_API_KEY', ''),
        },
        'AICTE': {
            'url': 'https://www.aicte-india.org/api',
            'api_key': os.getenv('AICTE_API_KEY', ''),
        }
    }


class DevelopmentConfig(Config):
    """Development environment configuration."""
    DEBUG = True
    TESTING = False
    SQLALCHEMY_ECHO = True


class TestingConfig(Config):
    """Testing environment configuration."""
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=300)


class ProductionConfig(Config):
    """Production environment configuration."""
    DEBUG = False
    TESTING = False
    # Production should use environment variables exclusively
    SQLALCHEMY_ECHO = False


# Configuration dictionary
config_dict = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}


def get_config():
    """Get configuration based on FLASK_ENV environment variable."""
    env = os.getenv('FLASK_ENV', 'development')
    return config_dict.get(env, DevelopmentConfig)
