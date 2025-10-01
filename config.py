import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_key")
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URI", "sqlite:///uei.db"
    )  # Change to PostgreSQL/MySQL for production
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt_secret_key")
