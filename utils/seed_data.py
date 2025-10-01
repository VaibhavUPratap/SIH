"""
Seed database with sample data for testing and demonstration.
"""
from models import db
from models.user import User
from models.student import Student
from models.teacher import Teacher
from models.institution import Institution
from models.scheme import Scheme
from datetime import datetime, date, timedelta
from faker import Faker

fake = Faker('en_IN')


def seed_database():
    """Seed database with sample data."""
    print("Seeding database with sample data...")
    
    # Clear existing data
    db.session.query(User).delete()
    db.session.commit()
    
    # Create institutions
    institutions = create_institutions()
    
    # Create students
    students = create_students(institutions)
    
    # Create teachers
    teachers = create_teachers(institutions)
    
    # Create schemes
    schemes = create_schemes()
    
    print(f"Created {len(institutions)} institutions")
    print(f"Created {len(students)} students")
    print(f"Created {len(teachers)} teachers")
    print(f"Created {len(schemes)} schemes")
    print("Database seeding completed!")


def create_institutions():
    """Create sample institutions."""
    institutions = []
    
    institution_data = [
        {
            'name': 'Indian Institute of Technology Delhi',
            'code': 'IIT-D',
            'type': 'University',
            'city': 'New Delhi',
            'state': 'Delhi'
        },
        {
            'name': 'National Institute of Technology Trichy',
            'code': 'NIT-T',
            'type': 'Institute',
            'city': 'Tiruchirappalli',
            'state': 'Tamil Nadu'
        },
        {
            'name': 'Delhi University',
            'code': 'DU',
            'type': 'University',
            'city': 'New Delhi',
            'state': 'Delhi'
        }
    ]
    
    for idx, data in enumerate(institution_data, 1):
        # Create user
        user = User(
            email=f"institution{idx}@uei.edu.in",
            username=f"inst{idx}",
            full_name=data['name'],
            role='institution',
            is_active=True,
            is_verified=True
        )
        user.set_password('password123')
        db.session.add(user)
        db.session.flush()
        
        # Create institution
        institution = Institution(
            user_id=user.id,
            institution_name=data['name'],
            institution_code=data['code'],
            aishe_code=f"AISHE{idx:04d}",
            institution_type=data['type'],
            category='Government',
            city=data['city'],
            state=data['state'],
            year_of_establishment=2000 - idx * 10,
            ugc_recognized=True,
            aicte_approved=True,
            verified=True
        )
        db.session.add(institution)
        institutions.append(institution)
    
    db.session.commit()
    return institutions


def create_students(institutions):
    """Create sample students."""
    students = []
    
    for i in range(10):
        # Create user
        user = User(
            email=f"student{i+1}@example.com",
            username=f"student{i+1}",
            full_name=fake.name(),
            role='student',
            phone_number=fake.phone_number()[:10],
            date_of_birth=fake.date_of_birth(minimum_age=18, maximum_age=25),
            is_active=True
        )
        user.set_password('password123')
        db.session.add(user)
        db.session.flush()
        
        # Create student
        institution = institutions[i % len(institutions)]
        student = Student(
            user_id=user.id,
            enrollment_number=f"EN{2023}{i+1:04d}",
            institution_id=institution.id,
            program='B.Tech',
            specialization='Computer Science',
            year_of_study=2,
            semester=4,
            enrollment_date=date(2021, 7, 1),
            cgpa=round(6.0 + (i % 3), 2),
            category='General' if i % 3 == 0 else 'OBC',
            gender='Male' if i % 2 == 0 else 'Female',
            city=fake.city(),
            state=fake.state()
        )
        db.session.add(student)
        students.append(student)
    
    db.session.commit()
    return students


def create_teachers(institutions):
    """Create sample teachers."""
    teachers = []
    
    for i in range(5):
        # Create user
        user = User(
            email=f"teacher{i+1}@example.com",
            username=f"teacher{i+1}",
            full_name=fake.name(),
            role='teacher',
            phone_number=fake.phone_number()[:10],
            is_active=True
        )
        user.set_password('password123')
        db.session.add(user)
        db.session.flush()
        
        # Create teacher
        institution = institutions[i % len(institutions)]
        teacher = Teacher(
            user_id=user.id,
            employee_id=f"EMP{2020}{i+1:03d}",
            institution_id=institution.id,
            designation='Assistant Professor' if i < 3 else 'Associate Professor',
            department='Computer Science',
            highest_qualification='Ph.D.',
            date_of_joining=date(2018, 8, 1),
            total_publications=5 + i,
            total_citations=50 + i * 10
        )
        db.session.add(teacher)
        teachers.append(teacher)
    
    db.session.commit()
    return teachers


def create_schemes():
    """Create sample schemes."""
    schemes = []
    
    scheme_data = [
        {
            'name': 'National Scholarship Portal',
            'code': 'NSP2024',
            'type': 'scholarship',
            'department': 'MoE',
            'target_group': 'student'
        },
        {
            'name': 'UGC Research Fellowship',
            'code': 'UGC-RF-2024',
            'type': 'fellowship',
            'department': 'UGC',
            'target_group': 'student'
        },
        {
            'name': 'Faculty Development Programme',
            'code': 'FDP-2024',
            'type': 'grant',
            'department': 'AICTE',
            'target_group': 'teacher'
        }
    ]
    
    for data in scheme_data:
        scheme = Scheme(
            scheme_name=data['name'],
            scheme_code=data['code'],
            scheme_type=data['type'],
            description=f"Description for {data['name']}",
            department=data['department'],
            target_group=data['target_group'],
            amount_min=10000,
            amount_max=50000,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=365),
            is_active=True
        )
        db.session.add(scheme)
        schemes.append(scheme)
    
    db.session.commit()
    return schemes
