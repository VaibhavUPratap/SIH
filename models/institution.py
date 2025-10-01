from utils.db import db

class Institution(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    aishe_code = db.Column(db.String(50), unique=True, nullable=False)
    admin_aadhaar_hash = db.Column(db.String(200), nullable=False)
    nirf_data = db.Column(db.JSON)
