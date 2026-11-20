from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    name, email, password = (data.get("name") or "").strip(), (data.get("email") or "").strip().lower(), data.get("password") or ""
    if not name or not email or len(password) < 6:
        return jsonify({"error": "Name, valid email, and password (at least 6 characters) are required."}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists."}), 409
    user = User(name=name, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    token = create_access_token(identity=str(user.id))
    return jsonify({"user": user.to_dict(), "access_token": token}), 201

@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email, password = (data.get("email") or "").strip().lower(), data.get("password") or ""
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Incorrect email or password."}), 401
    return jsonify({"user": user.to_dict(), "access_token": create_access_token(identity=str(user.id))})

@auth_bp.get("/me")
@jwt_required()
def me():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()})
