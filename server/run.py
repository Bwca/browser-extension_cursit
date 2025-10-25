"""
Entry point for the Cursor HTTP Server.

Usage:
    python run.py
"""
import os
from app import create_app
from app.config import Config
from app.utils.logger import get_logger

# Create the Flask application
app = create_app()

logger = get_logger(__name__)

if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info(f"Cursor HTTP server starting at http://{Config.HOST}:{Config.PORT}/open")
    logger.info("=" * 60)
    
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        threaded=True,
        debug=os.environ.get('FLASK_ENV') == 'development'
    )

