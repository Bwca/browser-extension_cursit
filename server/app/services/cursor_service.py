# ============================================================================
# Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
# File: server/app/services/cursor_service.py
# Purpose: Cursor IDE operations - file opening and keyboard automation
#
# Copyright (c) 2025 Volodymyr Yepishev
#              All rights reserved.
#
# Licensed under GNU General Public License v3.0
# ============================================================================

"""
Cursor IDE integration service.
"""
import os
import subprocess
import time
from typing import Tuple, Optional
from app.config import Config
from app.utils.logger import get_logger
from app.services.window_service import WindowService

logger = get_logger(__name__)

try:
    import win32gui
    import win32con
    import win32api
    import win32process
except Exception:
    win32gui = None
    win32con = None
    win32api = None
    win32process = None


class CursorService:
    """Service for Cursor IDE operations."""
    
    @staticmethod
    def open_file_only(workspace_path: Optional[str], file_path: str) -> Tuple[bool, str]:
        """
        Open a file in Cursor WITHOUT any clipboard or chat operations.
        This is a simple file opening operation with no side effects.
        
        Args:
            workspace_path: Path to the workspace/repo root (optional)
            file_path: Path to the file to open
            
        Returns:
            Tuple[bool, str]: (success, note_or_error)
        """
        try:
            # If workspace_path provided, open workspace first, then add the file
            if workspace_path and os.path.exists(workspace_path):
                logger.info(f"Opening workspace: {workspace_path}")
                logger.info(f"Then opening file: {file_path}")
                # Open workspace with the file in one command
                subprocess.Popen(
                    [Config.CURSOR_EXECUTABLE_NAME, workspace_path, file_path],
                    shell=True
                )
                logger.info("Successfully spawned cursor process with workspace and file")
                return True, f"workspace: {workspace_path}"
            else:
                # Fallback: just open the file
                logger.info(f"No workspace provided, opening file directly: {file_path}")
                subprocess.Popen([Config.CURSOR_EXECUTABLE_NAME, file_path], shell=True)
                logger.info("Successfully spawned cursor process with file only")
                return True, ""
        except Exception as e:
            logger.warning(f"cursor command failed: {e}, falling back to os.startfile")
            try:
                os.startfile(file_path)
                logger.info("Opened file via os.startfile")
                return True, "(opened via os.startfile; 'cursor' command may not be on PATH)"
            except Exception as e2:
                logger.error(f"Failed to open file: {e2}")
                return False, f"Failed to open file: {e2}"
    
    @staticmethod
    def open_workspace_and_file(workspace_path: Optional[str], file_path: str) -> Tuple[bool, str]:
        """
        Open a workspace/repo in Cursor, then open the specific file.
        
        Args:
            workspace_path: Path to the workspace/repo root (optional)
            file_path: Path to the file to open
            
        Returns:
            Tuple[bool, str]: (success, note_or_error)
        """
        try:
            # If workspace_path provided, open workspace first, then add the file
            if workspace_path and os.path.exists(workspace_path):
                logger.info(f"Opening workspace: {workspace_path}")
                logger.info(f"Then opening file: {file_path}")
                # Open workspace with the file in one command
                subprocess.Popen(
                    [Config.CURSOR_EXECUTABLE_NAME, workspace_path, file_path],
                    shell=True
                )
                logger.info("Successfully spawned cursor process with workspace and file")
                return True, f"workspace: {workspace_path}"
            else:
                # Fallback: just open the file
                logger.info(f"No workspace provided, opening file directly: {file_path}")
                subprocess.Popen([Config.CURSOR_EXECUTABLE_NAME, file_path], shell=True)
                logger.info("Successfully spawned cursor process with file only")
                return True, ""
        except Exception as e:
            logger.warning(f"cursor command failed: {e}, falling back to os.startfile")
            try:
                os.startfile(file_path)
                logger.info("Opened file via os.startfile")
                return True, "(opened via os.startfile; 'cursor' command may not be on PATH)"
            except Exception as e2:
                logger.error(f"Failed to open file: {e2}")
                return False, f"Failed to open file: {e2}"
    
    @staticmethod
    def bring_window_to_front_and_paste(
        target_filename: Optional[str] = None,
        auto_submit: bool = False
    ) -> Tuple[bool, str]:
        """
        Bring Cursor window to front and paste clipboard content into chat.
        
        Args:
            target_filename: Optional filename to find specific window
            auto_submit: If True, automatically submit the message
            
        Returns:
            Tuple[bool, str]: (success, error_message)
        """
        if win32gui is None or win32api is None:
            logger.warning("pywin32 not installed, cannot focus window")
            return False, "pywin32 not installed"
        
        try:
            window = WindowService.find_cursor_window(target_filename)
            if window is None:
                window = WindowService.find_cursor_window(None)
                if window is None:
                    return False, "No window with 'Cursor' in title found"
            
            hwnd, title = window
            logger.info(f"Focusing window: {title}")
            
            # Bring window to front - multiple methods
            try:
                # Method 1: Standard approach
                win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
                time.sleep(0.05)
                win32gui.ShowWindow(hwnd, win32con.SW_MAXIMIZE)
                time.sleep(0.05)
            except Exception as e:
                logger.warning(f"ShowWindow failed: {e}")
            
            # Method 2: Try SetForegroundWindow with thread attachment
            try:
                # Get foreground thread
                foreground_hwnd = win32gui.GetForegroundWindow()
                foreground_thread = win32process.GetWindowThreadProcessId(foreground_hwnd)[0]
                current_thread = win32api.GetCurrentThreadId()
                
                # Attach to foreground thread
                if foreground_thread != current_thread:
                    win32process.AttachThreadInput(foreground_thread, current_thread, True)
                
                # Try to set foreground
                win32gui.SetForegroundWindow(hwnd)
                
                # Detach
                if foreground_thread != current_thread:
                    win32process.AttachThreadInput(foreground_thread, current_thread, False)
                    
                logger.info("✓ Window brought to foreground")
            except Exception as e:
                logger.warning(f"SetForegroundWindow failed, trying fallback: {e}")
                # Fallback: BringWindowToTop
                try:
                    win32gui.BringWindowToTop(hwnd)
                    win32gui.SetActiveWindow(hwnd)
                except:
                    pass
            
            time.sleep(0.2)
            
            # Send keyboard commands
            CursorService._open_chat_and_paste(auto_submit)
            
            note = "Pasted and submitted" if auto_submit else "Pasted (ready for manual submit)"
            logger.info(f"✓ {note}: {title}")
            return True, ""
            
        except Exception as e:
            logger.error(f"Error bringing window to front: {e}", exc_info=True)
            return False, str(e)
    
    @staticmethod
    def _open_chat_and_paste(auto_submit: bool = False):
        """
        Send keyboard commands to open chat and paste content.
        
        Args:
            auto_submit: If True, automatically submit after pasting
        """
        # Define key codes
        VK_ESCAPE = 0x1B
        VK_CONTROL = 0x11
        VK_L = 0x4C
        VK_V = 0x56
        VK_RETURN = 0x0D
        
        # Open chat with ESC + Ctrl+L
        logger.info("Opening chat with ESC + Ctrl+L...")
        
        # ESC to clear any modals
        win32api.keybd_event(VK_ESCAPE, 0, 0, 0)
        time.sleep(0.02)
        win32api.keybd_event(VK_ESCAPE, 0, 0x0002, 0)
        time.sleep(0.75)
        
        # Ctrl+L to open chat
        win32api.keybd_event(VK_CONTROL, 0, 0, 0)
        time.sleep(0.02)
        win32api.keybd_event(VK_L, 0, 0, 0)
        time.sleep(0.02)
        win32api.keybd_event(VK_L, 0, 0x0002, 0)
        time.sleep(0.02)
        win32api.keybd_event(VK_CONTROL, 0, 0x0002, 0)
        
        # Poll for chat to be ready (small window for input to appear)
        time.sleep(0.5)
        
        # Paste
        logger.info("Pasting...")
        win32api.keybd_event(VK_CONTROL, 0, 0, 0)
        time.sleep(0.02)
        win32api.keybd_event(VK_V, 0, 0, 0)
        time.sleep(0.02)
        win32api.keybd_event(VK_V, 0, 0x0002, 0)
        time.sleep(0.02)
        win32api.keybd_event(VK_CONTROL, 0, 0x0002, 0)
        
        time.sleep(0.2)
        logger.info("✓ Paste command sent")
        
        # If auto_submit, re-focus and press Enter
        if auto_submit:
            time.sleep(0.3)
            
            # Re-focus chat
            logger.info("Re-focusing chat and submitting...")
            win32api.keybd_event(VK_ESCAPE, 0, 0, 0)
            time.sleep(0.02)
            win32api.keybd_event(VK_ESCAPE, 0, 0x0002, 0)
            time.sleep(0.2)
            
            win32api.keybd_event(VK_CONTROL, 0, 0, 0)
            time.sleep(0.02)
            win32api.keybd_event(VK_L, 0, 0, 0)
            time.sleep(0.02)
            win32api.keybd_event(VK_L, 0, 0x0002, 0)
            time.sleep(0.02)
            win32api.keybd_event(VK_CONTROL, 0, 0x0002, 0)
            time.sleep(0.3)
            
            # Submit with Enter
            win32api.keybd_event(VK_RETURN, 0, 0, 0)
            time.sleep(0.02)
            win32api.keybd_event(VK_RETURN, 0, 0x0002, 0)

