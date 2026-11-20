from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Publication, Project
import csv, io

publications_bp = Blueprint("publications", __name__)

@publications_bp.get("")
@jwt_required()
def list_publications():
    items = Publication.query.filter_by(user_id=int(get_jwt_identity())).order_by(Publication.created_at.desc()).all()
    return jsonify([x.to_dict() for x in items])

@publications_bp.post("")
@jwt_required()
def create_publication():
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    if not title: return jsonify({"error": "Publication title is required."}), 400
    uid = int(get_jwt_identity())
    project_id = data.get("project_id") or None
    if project_id and not Project.query.filter_by(id=project_id, user_id=uid).first():
        return jsonify({"error": "Selected project was not found."}), 404
    item = Publication(user_id=uid, project_id=project_id, title=title,
        journal=data.get("journal", ""), authors=data.get("authors", ""),
        doi=data.get("doi", ""), status=data.get("status", "Draft"),
        submission_date=data.get("submission_date", ""), notes=data.get("notes", ""))
    db.session.add(item); db.session.commit()
    return jsonify(item.to_dict()), 201

def owned_publication(item_id):
    return Publication.query.filter_by(id=item_id, user_id=int(get_jwt_identity())).first()

@publications_bp.route("/<int:item_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def publication_detail(item_id):
    item = owned_publication(item_id)
    if not item: return jsonify({"error": "Publication not found."}), 404
    if request.method == "GET": return jsonify(item.to_dict())
    if request.method == "DELETE":
        db.session.delete(item); db.session.commit()
        return jsonify({"message": "Publication deleted."})
    data = request.get_json(silent=True) or {}
    for field in ["title", "journal", "authors", "doi", "status", "submission_date", "notes"]:
        if field in data: setattr(item, field, data[field])
    if "project_id" in data:
        pid = data["project_id"] or None
        if pid and not Project.query.filter_by(id=pid, user_id=int(get_jwt_identity())).first():
            return jsonify({"error": "Selected project was not found."}), 404
        item.project_id = pid
    db.session.commit()
    return jsonify(item.to_dict())

@publications_bp.get("/export")
@jwt_required()
def export_publications():
    items = Publication.query.filter_by(user_id=int(get_jwt_identity())).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Title", "Journal", "Authors", "DOI", "Status", "Submission Date", "Notes"])
    for x in items: writer.writerow([x.title, x.journal, x.authors, x.doi, x.status, x.submission_date, x.notes])
    return Response(output.getvalue(), mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=publications.csv"})
