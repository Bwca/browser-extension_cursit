"""API routes for the Cursor HTTP Server."""
from flask import Blueprint

# Create blueprint
open_bp = Blueprint('open', __name__)

# Import routes to register them with blueprint
from app.routes import open_routes

