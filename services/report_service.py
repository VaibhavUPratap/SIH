from services.analytics_service import AnalyticsService
from models.user import User, db
from models.student import Student
from models.teacher import Teacher
from models.institution import Institution
import json
from datetime import datetime

class ReportService:
    
    @staticmethod
    def generate_admin_report():
        """Generate comprehensive admin report"""
        system_overview = AnalyticsService.get_system_overview()
        student_trends = AnalyticsService.get_student_performance_trends()
        institution_rankings = AnalyticsService.get_institution_rankings()
        teacher_stats = AnalyticsService.get_teacher_evaluation_stats()
        
        return {
            'report_generated_at': datetime.utcnow().isoformat(),
            'system_overview': system_overview,
            'student_performance': student_trends,
            'institution_rankings': institution_rankings,
            'teacher_evaluation_stats': teacher_stats
        }
    
    @staticmethod
    def generate_institution_report(institution_id):
        """Generate report for specific institution"""
        institution = Institution.query.get(institution_id)
        if not institution:
            return None
        
        # Count associated students and teachers
        # Note: In a real implementation, you'd have proper relationships
        total_students = Student.query.count()  # This would be filtered by institution
        total_teachers = Teacher.query.count()  # This would be filtered by institution
        
        return {
            'institution_name': institution.institution_name,
            'aishe_code': institution.aishe_code,
            'nirf_rank': institution.nirf_rank,
            'established_year': institution.established_year,
            'total_students': total_students,
            'total_teachers': total_teachers,
            'schemes': json.loads(institution.schemes) if institution.schemes else [],
            'report_generated_at': datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def generate_student_report(student_id):
        """Generate report for specific student"""
        student = Student.query.get(student_id)
        if not student:
            return None
        
        projects = json.loads(student.projects) if student.projects else []
        courses = json.loads(student.courses) if student.courses else []
        
        return {
            'student_name': student.user.name,
            'enrollment_no': student.enrollment_no,
            'academic_progress': student.academic_progress,
            'total_projects': len(projects),
            'total_courses': len(courses),
            'projects': projects,
            'courses': courses,
            'report_generated_at': datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def generate_teacher_report(teacher_id):
        """Generate report for specific teacher"""
        teacher = Teacher.query.get(teacher_id)
        if not teacher:
            return None
        
        evaluations = json.loads(teacher.evaluations) if teacher.evaluations else []
        
        return {
            'teacher_name': teacher.user.name,
            'apar_id': teacher.apar_id,
            'subject': teacher.subject,
            'department': teacher.department,
            'total_evaluations': len(evaluations),
            'evaluations': evaluations,
            'report_generated_at': datetime.utcnow().isoformat()
        }