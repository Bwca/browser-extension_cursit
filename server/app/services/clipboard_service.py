"""
Clipboard operations service.
"""
from typing import Tuple
from app.utils.logger import get_logger

logger = get_logger(__name__)

try:
    import pyperclip
except Exception:
    pyperclip = None
    logger.warning("pyperclip not installed, clipboard operations will be unavailable")


class ClipboardService:
    """Service for clipboard operations."""
    
    @staticmethod
    def copy(message: str) -> Tuple[bool, str]:
        """
        Copy message to clipboard.
        
        Args:
            message: Text to copy to clipboard
            
        Returns:
            Tuple[bool, str]: (success, error_message)
        """
        if pyperclip is None:
            return False, "pyperclip not installed"
        
        try:
            pyperclip.copy(message or "")
            logger.info("Message copied to clipboard")
            return True, ""
        except Exception as e:
            error_msg = str(e)
            logger.warning(f"Failed to copy to clipboard: {error_msg}")
            return False, error_msg

