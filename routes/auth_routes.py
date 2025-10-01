from flask import Blueprint, request, render_template, redirect, url_for, session
from models.user import User
from utils.db import db

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["GET"])
def login_page():
    return render_template("login.html")

@auth_bp.route("/register", methods=["GET"])
def register_page():
    return render_template("register.html")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.form
    user = User(
        name=data["name"],
        email=data["email"],
        role=data["role"]
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    return redirect(url_for("auth.login_page"))

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.form
    user = User.query.filter_by(email=data["email"]).first()
    if user and user.check_password(data["password"]):
        session["user_id"] = user.id
        session["role"] = user.role
        session["name"] = user.name
        # Redirect to role-based dashboard
        if user.role == "student":
            return redirect(url_for("student.dashboard"))
        elif user.role == "teacher":
            return redirect(url_for("teacher.dashboard"))
        elif user.role == "institution":
            return redirect(url_for("institution.dashboard"))
        else:
            return redirect(url_for("admin.dashboard"))
    return "Invalid credentials", 401

@auth_bp.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("auth.login_page"))
