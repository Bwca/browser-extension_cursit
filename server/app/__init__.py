"""
Application factory for the Cursor HTTP Server.
"""
from flask import Flask
from app.config import Config
from app.utils.logger import setup_logging


def create_app(config_class=Config):
    """
    Create and configure the Flask application.
    
    Args:
        config_class: Configuration class to use
        
    Returns:
        Flask: Configured Flask application
    """
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Setup logging
    setup_logging()
    
    # Register blueprints
    from app.routes import open_bp
    app.register_blueprint(open_bp)
    
    return app

