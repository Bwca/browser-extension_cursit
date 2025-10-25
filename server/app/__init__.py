# ============================================================================
# Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
# File: server/app/__init__.py
# Purpose: Application factory for Flask application
#
# Copyright (c) 2025 Volodymyr Yepishev
#              All rights reserved.
#
# Licensed under GNU General Public License v3.0
# ============================================================================

"""
Application factory for the Cursor HTTP Server.

Author: Volodymyr Yepishev
License: GPL-3.0
"""

__version__ = '0.1.0'
__author__ = 'Volodymyr Yepishev'
__license__ = 'GPL-3.0'

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

