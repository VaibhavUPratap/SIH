from models.user import User, db
from models.student import Student
from models.teacher import Teacher
from models.institution import Institution
from utils.helpers import text_to_json
import json
from sqlalchemy import func

class AnalyticsService:
    
    @staticmethod
    def get_system_overview():
        """Get system-wide analytics"""
        return {
            'total_users': User.query.count(),
            'total_students': Student.query.count(),
            'total_teachers': Teacher.query.count(),
            'total_institutions': Institution.query.count(),
            'users_by_role': {
                'student': User.query.filter_by(role='student').count(),
                'teacher': User.query.filter_by(role='teacher').count(),
                'institution': User.query.filter_by(role='institution').count(),
                'admin': User.query.filter_by(role='admin').count()
            }
        }
    
    @staticmethod
    def get_student_performance_trends():
        """Analyze student performance trends"""
        students = Student.query.all()
        performance_data = []
        
        for student in students:
            projects = text_to_json(student.projects) or []
            performance_data.append({
                'student_id': student.id,
                'academic_progress': student.academic_progress,
                'projects_count': len(projects),
                'enrollment_no': student.enrollment_no
            })
        
        return {
            'average_progress': sum(s['academic_progress'] for s in performance_data) / len(performance_data) if performance_data else 0,
            'total_projects': sum(s['projects_count'] for s in performance_data),
            'student_performance': performance_data
        }
    
    @staticmethod
    def get_institution_rankings():
        """Get institution ranking data"""
        institutions = Institution.query.all()
        ranking_data = []
        
        for institution in institutions:
            schemes = text_to_json(institution.schemes) or []
            ranking_data.append({
                'institution_name': institution.institution_name,
                'nirf_rank': institution.nirf_rank,
                'aishe_code': institution.aishe_code,
                'schemes_count': len(schemes),
                'established_year': institution.established_year
            })
        
        # Sort by NIRF rank (lower is better)
        ranking_data.sort(key=lambda x: x['nirf_rank'] if x['nirf_rank'] else 9999)
        
        return {
            'institutions': ranking_data,
            'total_institutions': len(ranking_data),
            'average_schemes_per_institution': sum(i['schemes_count'] for i in ranking_data) / len(ranking_data) if ranking_data else 0
        }
    
    @staticmethod
    def get_teacher_evaluation_stats():
        """Get teacher evaluation statistics"""
        teachers = Teacher.query.all()
        evaluation_data = []
        
        for teacher in teachers:
            evaluations = text_to_json(teacher.evaluations) or []
            evaluation_data.append({
                'teacher_id': teacher.id,
                'apar_id': teacher.apar_id,
                'subject': teacher.subject,
                'department': teacher.department,
                'evaluations_count': len(evaluations)
            })
        
        return {
            'total_evaluations': sum(e['evaluations_count'] for e in evaluation_data),
            'average_evaluations_per_teacher': sum(e['evaluations_count'] for e in evaluation_data) / len(evaluation_data) if evaluation_data else 0,
            'teacher_stats': evaluation_data
        }