from .user import db

class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    enrollment_no = db.Column(db.String(50), unique=True, nullable=False)
    courses = db.Column(db.Text)  # JSON string of courses
    projects = db.Column(db.Text)  # JSON string of projects
    academic_progress = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'enrollment_no': self.enrollment_no,
            'courses': self.courses,
            'projects': self.projects,
            'academic_progress': self.academic_progress
        }