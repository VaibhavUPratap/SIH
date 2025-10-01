from utils.db import db

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    enrollment_no = db.Column(db.String(50), unique=True, nullable=False)
    aadhaar_hash = db.Column(db.String(200), unique=True, nullable=False)
    performance_data = db.Column(db.JSON)  # store marks, projects, achievements
