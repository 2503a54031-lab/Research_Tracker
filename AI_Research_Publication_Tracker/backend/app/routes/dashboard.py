from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Project, Publication

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.get("/dashboard")
@jwt_required()
def dashboard():
    uid = int(get_jwt_identity())
    projects = Project.query.filter_by(user_id=uid).all()
    publications = Publication.query.filter_by(user_id=uid).all()
    project_statuses = {}
    for item in projects:
        project_statuses[item.status] = project_statuses.get(item.status, 0) + 1
    statuses = {}
    for item in publications: statuses[item.status] = statuses.get(item.status, 0) + 1
    return jsonify({
        "project_count": len(projects),
        "publication_count": len(publications),
        "active_projects": sum(1 for p in projects if p.status not in ["Completed", "On Hold"]),
        "accepted_publications": statuses.get("Accepted", 0),
        "project_status": [{"name": k, "value": v} for k, v in sorted(project_statuses.items())],
        "publication_status": [{"name": k, "value": v} for k, v in statuses.items()],
        "recent_projects": [p.to_dict() for p in projects[-5:][::-1]],
        "recent_publications": [p.to_dict() for p in publications[-5:][::-1]]
    })
