from flask import Blueprint, render_template, session

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/dashboard")
def dashboard():
    if session.get("role") != "admin":
        return "Unauthorized", 403
    return render_template("dashboard_admin.html")
