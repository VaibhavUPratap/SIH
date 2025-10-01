from flask import Blueprint, render_template, session

student_bp = Blueprint("student", __name__)

@student_bp.route("/dashboard")
def dashboard():
    if session.get("role") != "student":
        return "Unauthorized", 403
    return render_template("dashboard_student.html")
