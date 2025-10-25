"""
Message handling service for combining and storing messages.
"""
import os
import tempfile
from app.config import Config
from app.utils.logger import get_logger

logger = get_logger(__name__)


class MessageService:
    """Service for handling message operations."""
    
    @staticmethod
    def combine_message(comment: str, code_snippet: str) -> str:
        """
        Create a readable combined message from comment and code snippet.
        
        Args:
            comment: Comment text
            code_snippet: Code snippet text
            
        Returns:
            str: Combined message
        """
        parts = []
        if comment is not None and comment:
            parts.append(str(comment))
        if code_snippet is not None and code_snippet.strip():
            parts.append("\n--- CODE SNIPPET ---\n")
            parts.append(str(code_snippet))
        return "\n".join(parts)
    
    @staticmethod
    def save_to_temp(message: str) -> str:
        """
        Save message to a temporary file.
        
        Args:
            message: Message content to save
            
        Returns:
            str: Path to the saved file
        """
        tmpdir = tempfile.gettempdir()
        path = os.path.join(tmpdir, Config.TMP_MESSAGE_FILENAME)
        with open(path, "w", encoding="utf-8") as f:
            f.write(message or "")
        logger.info(f"Saved message to: {path}")
        return path

