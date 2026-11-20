import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

load_dotenv()
db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-change-me")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-change-me")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL") or "sqlite:///research_tracker.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 60 * 60 * 8

    frontend_origins = os.getenv(
        "FRONTEND_ORIGIN",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5176,http://127.0.0.1:5176",
    ).split(",")
    CORS(app, resources={r"/api/*": {"origins": [origin.strip() for origin in frontend_origins]}})
    db.init_app(app)
    jwt.init_app(app)

    from app.routes.auth import auth_bp
    from app.routes.projects import projects_bp
    from app.routes.publications import publications_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.assistant import assistant_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(projects_bp, url_prefix="/api/projects")
    app.register_blueprint(publications_bp, url_prefix="/api/publications")
    app.register_blueprint(dashboard_bp, url_prefix="/api")
    app.register_blueprint(assistant_bp, url_prefix="/api/assistant")

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "message": "Research Tracker API is running"})

    with app.app_context():
        from app.models import User, Project, Publication
        db.create_all()

    return app
