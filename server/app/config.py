"""
Configuration module for the Cursor HTTP Server.
"""
import os
import tempfile

# Load environment variables from .env file if dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv is optional


class Config:
    """Base configuration class."""
    
    # Server settings
    HOST = os.environ.get('CURSOR_SERVER_HOST', '127.0.0.1')
    PORT = int(os.environ.get('CURSOR_SERVER_PORT', 5050))
    
    # Cursor settings
    CURSOR_EXECUTABLE_NAME = os.environ.get('CURSOR_EXECUTABLE', 'cursor')
    
    # File settings
    TMP_MESSAGE_FILENAME = 'cursor_received_message.txt'
    LOG_FILENAME = 'cursor_listener.log'
    LOG_FILE_PATH = os.path.join(tempfile.gettempdir(), LOG_FILENAME)
    
    # Timeout settings (in seconds)
    CURSOR_STARTUP_TIMEOUT = float(os.environ.get('CURSOR_STARTUP_TIMEOUT', 15.0))
    CURSOR_READY_TIMEOUT = float(os.environ.get('CURSOR_READY_TIMEOUT', 5.0))
    FILE_LOAD_TIMEOUT_HOT = float(os.environ.get('FILE_LOAD_TIMEOUT_HOT', 8.0))
    FILE_LOAD_TIMEOUT_COLD = float(os.environ.get('FILE_LOAD_TIMEOUT_COLD', 15.0))
    
    # Polling settings
    POLL_INTERVAL = 0.2  # 200ms
    FILE_POLL_INTERVAL = 0.1  # 100ms
    REQUIRED_CONSECUTIVE_CHECKS = 3  # Number of consecutive successful checks for ready state
    
    # Timing settings (in seconds)
    WINDOW_SETTLE_TIME = 0.3
    UI_SETTLE_TIME = 0.3
    FALLBACK_DELAY = 0.5


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': Config
}

