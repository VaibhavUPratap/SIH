from flask import Blueprint, render_template, session

teacher_bp = Blueprint("teacher", __name__)

@teacher_bp.route("/dashboard")
def dashboard():
    if session.get("role") != "teacher":
        return "Unauthorized", 403
    return render_template("dashboard_teacher.html")
