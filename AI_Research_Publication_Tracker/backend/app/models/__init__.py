from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(160), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email}

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, index=True)
    title = db.Column(db.String(180), nullable=False)
    domain = db.Column(db.String(120), default="")
    description = db.Column(db.Text, default="")
    status = db.Column(db.String(40), default="Planning")
    start_date = db.Column(db.String(20), default="")
    target_date = db.Column(db.String(20), default="")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {k: getattr(self, k) for k in ["id", "title", "domain", "description", "status", "start_date", "target_date"]}

class Publication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, index=True)
    project_id = db.Column(db.Integer, db.ForeignKey("project.id"), nullable=True)
    title = db.Column(db.String(220), nullable=False)
    journal = db.Column(db.String(180), default="")
    authors = db.Column(db.String(220), default="")
    doi = db.Column(db.String(180), default="")
    status = db.Column(db.String(40), default="Draft")
    submission_date = db.Column(db.String(20), default="")
    notes = db.Column(db.Text, default="")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {k: getattr(self, k) for k in ["id", "project_id", "title", "journal", "authors", "doi", "status", "submission_date", "notes"]}
