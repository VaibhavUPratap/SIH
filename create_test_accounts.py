#!/usr/bin/env python3
"""
Script to create test accounts for all dashboard types
Run this script to populate the database with test users for each role.
"""

import os
import sys
import json
import uuid
from app import create_app
from models.user import db, User
from models.student import Student
from models.teacher import Teacher
from models.institution import Institution

def create_test_accounts():
    """Create test accounts for all user roles"""
    
    app = create_app()
    
    with app.app_context():
        # Clear existing test accounts to avoid duplicates
        existing_test_emails = [
            'student.test@edu.in',
            'teacher.test@edu.in', 
            'institution.test@edu.in',
            'admin.test@edu.in'
        ]
        
        for email in existing_test_emails:
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                print(f"Deleting existing test account: {email}")
                db.session.delete(existing_user)
        
        db.session.commit()
        
        # Test accounts data
        test_accounts = [
            {
                'name': 'Test Student',
                'email': 'student.test@edu.in',
                'password': 'student123',
                'role': 'student',
                'aadhaar_id': '123456789012',
                'profile_data': {
                    'roll_number': 'CS2021001',
                    'course': 'Computer Science Engineering',
                    'year_of_study': 3,
                    'batch': '2021-2025',
                    'institution_name': 'Indian Institute of Technology Delhi',
                    'cgpa': 8.5,
                    'phone': '9876543210',
                    'date_of_birth': '2003-05-15',
                    'gender': 'Male',
                    'address': 'New Delhi, India'
                }
            },
            {
                'name': 'Dr. Test Teacher',
                'email': 'teacher.test@edu.in',
                'password': 'teacher123',
                'role': 'teacher',
                'aadhaar_id': '234567890123',
                'profile_data': {
                    'employee_id': 'EMP001',
                    'department': 'Computer Science',
                    'designation': 'Associate Professor',
                    'subjects': ['Data Structures', 'Algorithms', 'Machine Learning'],
                    'apar_id': 'APAR2024001',
                    'qualification': 'Ph.D. Computer Science',
                    'experience_years': 12,
                    'phone': '9876543211',
                    'office_address': 'CS Department, IIT Delhi'
                }
            },
            {
                'name': 'Test Institution',
                'email': 'institution.test@edu.in',
                'password': 'institution123',
                'role': 'institution',
                'aadhaar_id': '345678901234',
                'profile_data': {
                    'institution_name': 'Indian Institute of Technology Delhi',
                    'aishe_code': 'U-0005',
                    'university_type': 'Institute of National Importance',
                    'established_year': 1961,
                    'address': 'Hauz Khas, New Delhi - 110016',
                    'contact': '+91-11-26591785',
                    'website': 'https://www.iitd.ac.in',
                    'accreditation': 'NAAC A++',
                    'nirf_rank': 2,
                    'total_students': 11000,
                    'total_faculty': 500
                }
            },
            {
                'name': 'Test Admin',
                'email': 'admin.test@edu.in',
                'password': 'admin123',
                'role': 'admin',
                'aadhaar_id': '456789012345',
                'profile_data': {
                    'department': 'System Administration',
                    'access_level': 'super_admin',
                    'permissions': ['user_management', 'system_config', 'verification_oversight']
                }
            }
        ]
        
        created_accounts = []
        
        for account_data in test_accounts:
            try:
                # Create user
                user = User(
                    name=account_data['name'],
                    email=account_data['email'],
                    role=account_data['role'],
                    aadhaar_id=account_data['aadhaar_id']
                )
                user.set_password(account_data['password'])
                
                db.session.add(user)
                db.session.flush()  # Get the user ID
                
                # Create role-specific profile
                profile_data = account_data['profile_data']
                
                if account_data['role'] == 'student':
                    student = Student(
                        id=str(uuid.uuid4()),
                        user_id=user.id,
                        enrollment_no=profile_data['roll_number'],
                        courses=json.dumps([profile_data['course']]),
                        academic_progress=profile_data.get('academic_progress', 75.0),
                        current_gpa=profile_data['cgpa'],
                        semester=profile_data['year_of_study'] * 2,
                        career_goals=profile_data.get('career_goals', 'Software Engineer'),
                        skills=json.dumps(['Python', 'JavaScript', 'Data Structures'])
                    )
                    db.session.add(student)
                    
                elif account_data['role'] == 'teacher':
                    teacher = Teacher(
                        id=str(uuid.uuid4()),
                        user_id=user.id,
                        apar_id=profile_data['apar_id'],
                        subject=', '.join(profile_data['subjects']),
                        department=profile_data['department'],
                        evaluations=json.dumps([
                            {'student_id': 'test', 'score': 85, 'subject': 'Mathematics', 'date': '2024-01-15'},
                            {'student_id': 'test2', 'score': 78, 'subject': 'Physics', 'date': '2024-01-14'}
                        ])
                    )
                    db.session.add(teacher)
                    
                elif account_data['role'] == 'institution':
                    institution = Institution(
                        id=str(uuid.uuid4()),
                        user_id=user.id,
                        institution_name=profile_data['institution_name'],
                        aishe_code=profile_data['aishe_code'],
                        established_year=profile_data['established_year'],
                        address=profile_data['address'],
                        nirf_rank=profile_data['nirf_rank'],
                        schemes=json.dumps([
                            {'name': 'PM USHA Scholarship', 'status': 'active', 'applications': 245},
                            {'name': 'Research Grant', 'status': 'pending', 'applications': 8}
                        ])
                    )
                    db.session.add(institution)
                
                db.session.commit()
                
                created_accounts.append({
                    'role': account_data['role'],
                    'email': account_data['email'],
                    'password': account_data['password'],
                    'name': account_data['name']
                })
                
                print(f"✅ Created {account_data['role']} account: {account_data['email']}")
                
            except Exception as e:
                print(f"❌ Error creating {account_data['role']} account: {str(e)}")
                db.session.rollback()
        
        print(f"\n🎉 Successfully created {len(created_accounts)} test accounts!")
        
        # Display account summary
        print("\n" + "="*60)
        print("TEST ACCOUNTS SUMMARY")
        print("="*60)
        
        for account in created_accounts:
            print(f"📧 {account['role'].upper()} ACCOUNT")
            print(f"   Email: {account['email']}")
            print(f"   Password: {account['password']}")
            print(f"   Name: {account['name']}")
            print()
        
        print("🔗 Access the test page at: http://localhost:5000/test")
        print("💡 Use these credentials to test each dashboard type!")
        
        return created_accounts

if __name__ == '__main__':
    print("🚀 Creating test accounts for EduVerify system...")
    print("-" * 50)
    
    try:
        accounts = create_test_accounts()
        print("\n✅ Test account creation completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error during test account creation: {str(e)}")
        sys.exit(1)