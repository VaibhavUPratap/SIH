from models.user import db

def init_db(app):
    db.init_app(app)

def create_tables(app):
    with app.app_context():
        db.create_all()