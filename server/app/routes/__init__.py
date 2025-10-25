# ============================================================================
# Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
# File: server/app/routes/__init__.py
# Purpose: Routes module initialization - Blueprint setup
#
# Copyright (c) 2025 Volodymyr Yepishev
#              All rights reserved.
#
# Licensed under GNU General Public License v3.0
# ============================================================================

"""API routes for the Cursor HTTP Server."""
from flask import Blueprint

# Create blueprint
open_bp = Blueprint('open', __name__)

# Import routes to register them with blueprint
from app.routes import open_routes

