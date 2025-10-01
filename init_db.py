#!/usr/bin/env python3
"""
Database initialization script for the UEI System
"""

from app import app
from utils.db import db
from models.user import User
from models.student import Student
from models.teacher import Teacher
from models.institution import Institution
from models.logs import Log

def init_database():
    """Initialize the database with all tables"""
    with app.app_context():
        try:
            # Create all tables
            db.create_all()
            print("✓ Database tables created successfully!")
            
            # Check if tables exist by querying metadata
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"✓ Created tables: {', '.join(tables)}")
            
        except Exception as e:
            print(f"✗ Error creating database: {e}")
            return False
    
    return True

if __name__ == "__main__":
    print("Initializing UEI System Database...")
    if init_database():
        print("✓ Database initialization completed successfully!")
    else:
        print("✗ Database initialization failed!")