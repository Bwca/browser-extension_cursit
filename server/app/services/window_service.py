# ============================================================================
# Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
# File: server/app/services/window_service.py
# Purpose: Window management and polling - Cursor detection and focus
#
# Copyright (c) 2025 Volodymyr Yepishev
#              All rights reserved.
#
# Licensed under GNU General Public License v3.0
# ============================================================================

"""
Window management and polling service.
"""
import os
import time
from typing import List, Tuple, Optional
from app.config import Config
from app.utils.logger import get_logger

logger = get_logger(__name__)

try:
    import win32gui
    import win32con
    import win32api
except Exception:
    win32gui = None
    win32con = None
    win32api = None
    logger.warning("pywin32 not installed, window operations will be unavailable")

try:
    import win32process
except Exception:
    win32process = None


class WindowService:
    """Service for window management and cursor detection."""
    
    @staticmethod
    def _get_cursor_windows() -> List[Tuple[int, str]]:
        """
        Get all visible Cursor windows.
        
        Returns:
            List[Tuple[int, str]]: List of (hwnd, title) tuples
        """
        if win32gui is None:
            return []
        
        def callback(hwnd, windows):
            if win32gui.IsWindowVisible(hwnd):
                title = win32gui.GetWindowText(hwnd)
                if title and "cursor" in title.lower():
                    windows.append((hwnd, title))
            return True
        
        cursor_windows = []
        win32gui.EnumWindows(callback, cursor_windows)
        return cursor_windows
    
    @staticmethod
    def is_cursor_running() -> bool:
        """
        Check if any Cursor window is currently open.
        
        Returns:
            bool: True if at least one Cursor window is found
        """
        if win32gui is None:
            return False
        
        try:
            cursor_windows = WindowService._get_cursor_windows()
            return len(cursor_windows) > 0
        except Exception as e:
            logger.error(f"Error checking if Cursor is running: {e}")
            return False
    
    @staticmethod
    def wait_for_cursor_startup(timeout: float = None) -> bool:
        """
        Wait for Cursor to start up (at least one window appears).
        
        Args:
            timeout: Maximum time to wait in seconds
            
        Returns:
            bool: True if Cursor window appears, False if timeout
        """
        if win32gui is None:
            return False
        
        if timeout is None:
            timeout = Config.CURSOR_STARTUP_TIMEOUT
        
        logger.info("Waiting for Cursor to start up...")
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            if WindowService.is_cursor_running():
                elapsed = time.time() - start_time
                logger.info(f"✓ Cursor started! (took {elapsed:.1f}s)")
                return True
            time.sleep(Config.POLL_INTERVAL)
        
        logger.warning(f"Timeout waiting for Cursor to start (waited {timeout}s)")
        return False
    
    @staticmethod
    def wait_for_cursor_ready(timeout: float = None) -> bool:
        """
        Wait for Cursor to be fully ready and responsive after startup.
        
        Args:
            timeout: Maximum time to wait in seconds
            
        Returns:
            bool: True if ready, False if timeout
        """
        if win32gui is None or win32process is None:
            return False
        
        if timeout is None:
            timeout = Config.CURSOR_READY_TIMEOUT
        
        logger.info("Waiting for Cursor to become responsive...")
        start_time = time.time()
        consecutive_checks = 0
        required_consecutive = Config.REQUIRED_CONSECUTIVE_CHECKS
        
        while time.time() - start_time < timeout:
            try:
                cursor_windows = WindowService._get_cursor_windows()
                
                if cursor_windows:
                    hwnd = cursor_windows[0][0]
                    
                    try:
                        thread_id, process_id = win32process.GetWindowThreadProcessId(hwnd)
                        
                        if process_id > 0:
                            consecutive_checks += 1
                            if consecutive_checks >= required_consecutive:
                                elapsed = time.time() - start_time
                                logger.info(f"✓ Cursor is responsive! (took {elapsed:.1f}s)")
                                return True
                        else:
                            consecutive_checks = 0
                    except:
                        consecutive_checks = 0
                else:
                    consecutive_checks = 0
                
                time.sleep(Config.POLL_INTERVAL)
            except Exception as e:
                logger.error(f"Error checking if Cursor is ready: {e}")
                consecutive_checks = 0
                time.sleep(Config.POLL_INTERVAL)
        
        logger.warning(f"Timeout waiting for Cursor to be ready (waited {timeout}s)")
        return False
    
    @staticmethod
    def wait_for_file_loaded(target_filename: str, timeout: float) -> bool:
        """
        Poll Cursor window titles to detect when the target file has been loaded.
        
        Args:
            target_filename: Filename to look for in window titles
            timeout: Maximum time to wait in seconds
            
        Returns:
            bool: True if file is detected in window title, False if timeout
        """
        if win32gui is None or not target_filename:
            return False
        
        target_basename = os.path.basename(target_filename).lower()
        logger.info(f"Polling for file to load: {target_basename}")
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                cursor_windows = WindowService._get_cursor_windows()
                
                for hwnd, title in cursor_windows:
                    if target_basename in title.lower():
                        elapsed = time.time() - start_time
                        logger.info(f"✓ File loaded! Found in window: {title} (took {elapsed:.1f}s)")
                        return True
                
                time.sleep(Config.FILE_POLL_INTERVAL)
            except Exception as e:
                logger.error(f"Error polling for file: {e}")
                return False
        
        logger.warning(f"Timeout waiting for file to load (waited {timeout}s)")
        return False
    
    @staticmethod
    def find_cursor_window(target_filename: Optional[str] = None) -> Optional[Tuple[int, str]]:
        """
        Find a Cursor window, optionally matching by filename.
        
        Args:
            target_filename: Optional filename to match in window title
            
        Returns:
            Optional[Tuple[int, str]]: (hwnd, title) or None if not found
        """
        cursor_windows = WindowService._get_cursor_windows()
        
        if not cursor_windows:
            return None
        
        logger.info(f"Found {len(cursor_windows)} Cursor window(s)")
        
        # If target_filename provided, try to find window with that file
        if target_filename:
            target_basename = os.path.basename(target_filename)
            for hwnd, title in cursor_windows:
                if target_basename.lower() in title.lower():
                    logger.info(f"Found matching window: {title}")
                    return (hwnd, title)
        
        # Return first window as fallback
        return cursor_windows[0]

