from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
from app.config import Config
from app.routes.search_routes import search_bp
from app.routes.product_routes import product_bp

mongo = PyMongo()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    CORS(app)
    mongo.init_app(app)

    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.chat_routes import chat_bp
    from app.routes.analysis_routes import analysis_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(product_bp)

    return app 