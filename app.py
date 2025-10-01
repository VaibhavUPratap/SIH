from flask import Flask
from flask_jwt_extended import JWTManager
from utils.db import db, migrate
from routes.auth_routes import auth_bp
from routes.student_routes import student_bp
from routes.teacher_routes import teacher_bp
from routes.institution_routes import institution_bp
from routes.admin_routes import admin_bp

app = Flask(__name__)
app.config.from_object("config.Config")

# Initialize extensions
db.init_app(app)
migrate.init_app(app, db)
jwt = JWTManager(app)
app.secret_key = app.config["SECRET_KEY"]

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(student_bp, url_prefix="/student")
app.register_blueprint(teacher_bp, url_prefix="/teacher")
app.register_blueprint(institution_bp, url_prefix="/institution")
app.register_blueprint(admin_bp, url_prefix="/admin")

if __name__ == "__main__":
    app.run(debug=True)
