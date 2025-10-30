# ============================================================================
# Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
# File: server/app/routes/open_routes.py
# Purpose: API endpoint for opening files in Cursor with comments
#
# Copyright (c) 2025 Volodymyr Yepishev
#              All rights reserved.
#
# Licensed under GNU General Public License v3.0
# ============================================================================

"""
Routes for opening files in Cursor and pasting messages.
"""
import os
import time
from flask import request, jsonify
from app.routes import open_bp
from app.config import Config
from app.utils.logger import get_logger
from app.services.message_service import MessageService
from app.services.clipboard_service import ClipboardService
from app.services.window_service import WindowService
from app.services.cursor_service import CursorService

logger = get_logger(__name__)


@open_bp.route("/open-file", methods=["POST"])
def open_file_only():
    """
    Open a file in Cursor WITHOUT pasting anything to chat.
    
    Expected JSON payload:
    {
        "filePath": "path/to/file.py",
        "workspacePath": "path/to/workspace" (optional)
    }
    
    Returns:
        JSON response with status and details
    """
    # Parse request
    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({"error": "Invalid JSON"}), 400
    
    # Extract parameters (support both camelCase and snake_case)
    file_path = data.get("filePath") or data.get("file_path")
    workspace_path = data.get("workspacePath") or data.get("workspace_path") or data.get("repoPath") or data.get("repo_path")
    
    # Log request
    logger.info("=" * 60)
    logger.info("Received POST /open-file request")
    logger.info(f"workspacePath: {workspace_path}")
    logger.info(f"filePath: {file_path}")
    
    # Validate file path
    if not file_path:
        logger.error("Missing filePath")
        return jsonify({"error": "Missing 'filePath'"}), 400
    
    # Normalize and validate file path
    file_path = os.path.expanduser(file_path)
    file_path = os.path.abspath(file_path)
    
    if not os.path.exists(file_path):
        logger.error(f"File does not exist: {file_path}")
        return jsonify({"error": "File does not exist", "filePath": file_path}), 400
    
    # Open workspace and file in Cursor (without any pasting)
    opened, open_msg = CursorService.open_file_only(workspace_path, file_path)
    if not opened:
        return jsonify({"error": "Failed to open file", "detail": open_msg}), 500
    
    # Check if Cursor was already running (cold start detection)
    cursor_was_running = WindowService.is_cursor_running()
    logger.info(f"Cursor was {'already running' if cursor_was_running else 'NOT running (cold start)'}")
    
    # If Cursor wasn't running, wait for it to start up and become responsive
    if not cursor_was_running:
        cursor_started = WindowService.wait_for_cursor_startup()
        if cursor_started:
            cursor_ready = WindowService.wait_for_cursor_ready()
            if not cursor_ready:
                logger.warning("Cursor responsiveness timeout, proceeding anyway...")
                time.sleep(Config.FALLBACK_DELAY)
        else:
            logger.warning("Cursor startup timeout, proceeding anyway...")
            time.sleep(1.0)
    
    # Wait for Cursor to open the file
    logger.info("Waiting for Cursor to open the file...")
    file_timeout = Config.FILE_LOAD_TIMEOUT_COLD if not cursor_was_running else Config.FILE_LOAD_TIMEOUT_HOT
    if workspace_path:
        file_timeout = max(file_timeout, 12.0)  # Longer timeout for workspace
    
    file_loaded = WindowService.wait_for_file_loaded(file_path, timeout=file_timeout)
    
    if not file_loaded:
        logger.warning("File load timeout, proceeding anyway...")
        time.sleep(0.5)
    
    # Bring window to front (without pasting)
    success, msg = CursorService.bring_window_to_front(target_filename=file_path)
    
    if not success:
        logger.error(f"Could not bring window to front: {msg}")
    
    # Build response
    response = {
        "status": "ok",
        "openedWorkspace": workspace_path,
        "openedFile": file_path,
        "note": "File opened in Cursor"
    }
    
    logger.info(f"✓ File opened successfully")
    logger.info("=" * 60)
    return jsonify(response), 200


@open_bp.route("/open", methods=["POST"])
def open_file():
    """
    Open a file in Cursor and paste comment/code into chat.
    
    Expected JSON payload:
    {
        "filePath": "path/to/file.py",
        "comment": "Comment text",
        "codeSnippet": "code here",
        "autoSubmit": false
    }
    
    Returns:
        JSON response with status and details
    """
    # Parse request
    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({"error": "Invalid JSON"}), 400
    
    # Extract parameters (support both camelCase and snake_case)
    comment = data.get("comment")
    code_snippet = data.get("codeSnippet") or data.get("code_snippet")
    file_path = data.get("filePath") or data.get("file_path")
    workspace_path = data.get("workspacePath") or data.get("workspace_path") or data.get("repoPath") or data.get("repo_path")
    auto_submit = data.get("autoSubmit", False) or data.get("auto_submit", False)
    
    # Log request
    logger.info("=" * 60)
    logger.info("Received POST /open request")
    logger.info(f"workspacePath: {workspace_path}")
    logger.info(f"filePath: {file_path}")
    logger.info(f"comment: {comment}")
    snippet_preview = code_snippet[:100] if code_snippet else None
    if snippet_preview:
        snippet_preview += '...' if len(code_snippet) > 100 else ''
    logger.info(f"codeSnippet: {snippet_preview}")
    logger.info(f"autoSubmit: {auto_submit}")
    
    # Validate file path
    if not file_path:
        logger.error("Missing filePath")
        return jsonify({"error": "Missing 'filePath'"}), 400
    
    # Normalize and validate file path
    file_path = os.path.expanduser(file_path)
    file_path = os.path.abspath(file_path)
    
    if not os.path.exists(file_path):
        logger.error(f"File does not exist: {file_path}")
        return jsonify({"error": "File does not exist", "filePath": file_path}), 400
    
    # Combine message
    combined_message = MessageService.combine_message(comment, code_snippet)
    
    # Open workspace and file in Cursor
    opened, open_msg = CursorService.open_workspace_and_file(workspace_path, file_path)
    if not opened:
        return jsonify({"error": "Failed to open file", "detail": open_msg}), 500
    
    # Save message to temp file
    try:
        saved_path = MessageService.save_to_temp(combined_message)
    except Exception as e:
        logger.error(f"Failed to write message to temp: {e}")
        return jsonify({"error": "Failed to write message to temp", "detail": str(e)}), 500
    
    # Copy to clipboard
    copied, copy_err = ClipboardService.copy(combined_message)
    if not copied:
        logger.warning(f"Failed to copy to clipboard: {copy_err}")
    
    # Check if Cursor was already running (cold start detection)
    cursor_was_running = WindowService.is_cursor_running()
    logger.info(f"Cursor was {'already running' if cursor_was_running else 'NOT running (cold start)'}")
    
    # If Cursor wasn't running, wait for it to start up and become responsive
    if not cursor_was_running:
        cursor_started = WindowService.wait_for_cursor_startup()
        if cursor_started:
            cursor_ready = WindowService.wait_for_cursor_ready()
            if not cursor_ready:
                logger.warning("Cursor responsiveness timeout, proceeding anyway...")
                time.sleep(Config.FALLBACK_DELAY)
        else:
            logger.warning("Cursor startup timeout, proceeding anyway...")
            time.sleep(1.0)
    
    # Wait for Cursor to open the file
    logger.info("Waiting for Cursor to open the file...")
    # Use longer timeout for workspace+file
    file_timeout = Config.FILE_LOAD_TIMEOUT_COLD if not cursor_was_running else Config.FILE_LOAD_TIMEOUT_HOT
    if workspace_path:
        file_timeout = max(file_timeout, 12.0)  # Longer timeout for workspace
    
    file_loaded = WindowService.wait_for_file_loaded(file_path, timeout=file_timeout)
    
    if not file_loaded:
        logger.warning("File load timeout, proceeding anyway...")
        time.sleep(0.5)
    
    # Bring window to front and paste
    success, msg = CursorService.bring_window_to_front_and_paste(
        target_filename=file_path,
        auto_submit=auto_submit
    )
    
    if not success:
        logger.error(f"Could not bring window to front: {msg}")
    
    # Build response
    note = "Pasted and submitted" if auto_submit else "Pasted (press Enter to submit)"
    response = {
        "status": "ok",
        "openedWorkspace": workspace_path,
        "openedFile": file_path,
        "messageSavedTo": saved_path,
        "autoSubmitted": auto_submit,
        "note": note
    }
    
    logger.info(f"✓ Request completed successfully: {note}")
    logger.info("=" * 60)
    return jsonify(response), 200

