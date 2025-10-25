# ============================================================================
# Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
# File: server/app/utils/logger.py
# Purpose: Logging configuration and utilities
#
# Copyright (c) 2025 Volodymyr Yepishev
#              All rights reserved.
#
# Licensed under GNU General Public License v3.0
# ============================================================================

"""
Logging configuration for the Cursor HTTP Server.
"""
import logging
from app.config import Config


def setup_logging():
    """Configure logging for the application."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(message)s',
        handlers=[
            logging.FileHandler(Config.LOG_FILE_PATH, encoding='utf-8'),
            logging.StreamHandler()
        ]
    )
    logger = logging.getLogger(__name__)
    logger.info(f"Logging to: {Config.LOG_FILE_PATH}")
    return logger


def get_logger(name):
    """
    Get a logger instance for the given name.
    
    Args:
        name: Name for the logger (typically __name__)
        
    Returns:
        logging.Logger: Configured logger instance
    """
    return logging.getLogger(name)

