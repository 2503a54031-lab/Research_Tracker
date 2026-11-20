from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Project

projects_bp = Blueprint("projects", __name__)

@projects_bp.get("")
@jwt_required()
def list_projects():
    items = Project.query.filter_by(user_id=int(get_jwt_identity())).order_by(Project.created_at.desc()).all()
    return jsonify([x.to_dict() for x in items])

@projects_bp.post("")
@jwt_required()
def create_project():
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify({"error": "Project title is required."}), 400
    item = Project(user_id=int(get_jwt_identity()), title=title,
        domain=data.get("domain", ""), description=data.get("description", ""),
        status=data.get("status", "Planning"), start_date=data.get("start_date", ""),
        target_date=data.get("target_date", ""))
    db.session.add(item); db.session.commit()
    return jsonify(item.to_dict()), 201

def owned_project(item_id):
    return Project.query.filter_by(id=item_id, user_id=int(get_jwt_identity())).first()

@projects_bp.route("/<int:item_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def project_detail(item_id):
    item = owned_project(item_id)
    if not item: return jsonify({"error": "Project not found."}), 404
    if request.method == "GET": return jsonify(item.to_dict())
    if request.method == "DELETE":
        db.session.delete(item); db.session.commit()
        return jsonify({"message": "Project deleted."})
    data = request.get_json(silent=True) or {}
    for field in ["title", "domain", "description", "status", "start_date", "target_date"]:
        if field in data: setattr(item, field, data[field])
    db.session.commit()
    return jsonify(item.to_dict())
