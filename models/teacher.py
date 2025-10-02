from .user import db

class Teacher(db.Model):
    __tablename__ = 'teachers'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    apar_id = db.Column(db.String(50), unique=True, nullable=False)
    subject = db.Column(db.String(100))
    evaluations = db.Column(db.Text)  # JSON string of evaluations
    department = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'apar_id': self.apar_id,
            'subject': self.subject,
            'evaluations': self.evaluations,
            'department': self.department
        }