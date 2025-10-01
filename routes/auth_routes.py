from flask import Blueprint, request, render_template, redirect, url_for, session, jsonify
from models.user import User
from utils.db import db

auth_bp = Blueprint("auth", __name__)

def get_request_data():
    """Helper function to get data from either form or JSON"""
    if request.is_json:
        return request.get_json()
    else:
        return request.form

@auth_bp.route("/login", methods=["GET"])
def login_page():
    return render_template("login.html")

@auth_bp.route("/register", methods=["GET"])
def register_page():
    return render_template("register.html")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = get_request_data()
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        if request.is_json:
            return jsonify({"error": "User already exists"}), 400
        return "User already exists", 400
    
    # Use 'username' if 'name' is not provided (for API compatibility)
    name = data.get("name") or data.get("username")
    if not name:
        if request.is_json:
            return jsonify({"error": "Name or username is required"}), 400
        return "Name is required", 400
    
    user = User(
        name=name,
        email=data["email"],
        role=data["role"]
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    
    if request.is_json:
        return jsonify({"message": "User registered successfully"}), 201
    return redirect(url_for("auth.login_page"))

@auth_bp.route("/login", methods=["POST"])
def login():
    data = get_request_data()
    
    # Support both email and username for login
    email_or_username = data.get("email") or data.get("username")
    if not email_or_username:
        if request.is_json:
            return jsonify({"error": "Email or username is required"}), 400
        return "Email or username is required", 400
    
    user = User.query.filter_by(email=email_or_username).first()
    if not user:
        # Try finding by username if email lookup failed
        user = User.query.filter_by(name=email_or_username).first()
    
    if user and user.check_password(data["password"]):
        session["user_id"] = user.id
        session["role"] = user.role
        session["name"] = user.name
        
        if request.is_json:
            return jsonify({
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": user.role
                }
            }), 200
        
        # Redirect to role-based dashboard for form requests
        if user.role == "student":
            return redirect(url_for("student.dashboard"))
        elif user.role == "teacher":
            return redirect(url_for("teacher.dashboard"))
        elif user.role == "institution":
            return redirect(url_for("institution.dashboard"))
        else:
            return redirect(url_for("admin.dashboard"))
    
    if request.is_json:
        return jsonify({"error": "Invalid credentials"}), 401
    return "Invalid credentials", 401

@auth_bp.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("auth.login_page"))
