from flask import Blueprint, render_template, session

institution_bp = Blueprint("institution", __name__)

@institution_bp.route("/dashboard")
def dashboard():
    if session.get("role") != "institution":
        return "Unauthorized", 403
    return render_template("dashboard_institution.html")
