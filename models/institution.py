from .user import db

class Institution(db.Model):
    __tablename__ = 'institutions'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    aishe_code = db.Column(db.String(50), unique=True, nullable=False)
    nirf_rank = db.Column(db.Integer)
    schemes = db.Column(db.Text)  # JSON string of schemes
    institution_name = db.Column(db.String(200))
    address = db.Column(db.Text)
    established_year = db.Column(db.Integer)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'aishe_code': self.aishe_code,
            'nirf_rank': self.nirf_rank,
            'schemes': self.schemes,
            'institution_name': self.institution_name,
            'address': self.address,
            'established_year': self.established_year
        }
