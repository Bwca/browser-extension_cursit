# CursIt HTTP Server (Python/Flask)

A modular Flask-based HTTP server that integrates with Cursor IDE to open files and automatically paste PR comments into Cursor Chat.

## Architecture

The application follows Flask best practices with a clean, modular structure:

```
server/
├── app/
│   ├── __init__.py           # Application factory
│   ├── config.py             # Configuration management
│   ├── routes/               # API endpoints
│   ├── services/             # Business logic
│   └── utils/                # Utilities (logging)
├── run.py                    # Application entry point
├── requirements.txt
└── README.md
```

## Installation

```bash
pip install -r requirements.txt
```

Or install dependencies individually:

```bash
pip install flask pyperclip pywin32 python-dotenv
```

## Running

```bash
python run.py
```

The server will start at `http://localhost:5050/open`

## Behavior

Accepts POST requests to `/open` with JSON payload:

```json
{
  "workspacePath": "C:\\path\\to\\workspace",
  "filePath": "C:\\path\\to\\workspace\\file.py",
  "comment": "Your comment here",
  "codeSnippet": "def foo(): pass",
  "autoSubmit": false
}
```

**Parameters:**

- `filePath` (required): Full path to the file to open
- `workspacePath` (optional but recommended): Full path to the workspace/repo root
- `comment` (optional): Comment/question to send
- `codeSnippet` (optional): Code snippet to include
- `autoSubmit` (optional, default: `false`): If `true`, automatically submits the message by pressing Enter

**Actions performed:**

1. Validates the file exists
2. **Detects if Cursor is already running (cold start detection)**
3. **Opens the workspace/repo in Cursor (if `workspacePath` provided), then opens the file**
   - This ensures the file opens in the correct project context
   - Prevents opening files in unrelated Cursor windows
4. **If Cursor wasn't running:**
   - Polls every 200ms for Cursor to start (up to 15s)
   - Polls every 200ms for Cursor to become responsive (up to 8s)
   - Uses consecutive successful checks to confirm readiness
5. **If Cursor was already running:** Proceeds immediately to file loading
6. Combines comment + code snippet into a message
7. Saves the message to temp file: `%TEMP%/cursor_received_message.txt`
8. Copies the message to clipboard
9. **Polls window titles every 100ms** to detect when file is loaded (8-15s timeout)
10. Waits 0.3s for UI to settle (much faster than old flat waits)
11. **Finds and focuses the Cursor window with that specific file**
12. **Opens Cursor Chat (ESC + Ctrl+L)**
13. **Automatically pastes the message into the chat input (Ctrl+V)**
14. If `autoSubmit=true`: **Automatically presses Enter to submit**
15. If `autoSubmit=false` (default): User can review and press Enter manually
16. Returns JSON response

**Response format:**

```json
{
  "status": "ok",
  "openedWorkspace": "C:\\full\\path\\to\\workspace",
  "openedFile": "C:\\full\\path\\to\\workspace\\file.py",
  "messageSavedTo": "C:\\Users\\...\\AppData\\Local\\Temp\\cursor_received_message.txt",
  "autoSubmitted": false,
  "note": "Pasted (press Enter to submit)"
}
```

If `autoSubmit=true`, the note will say: `"...pasted and submitted."`

## Key Features

### Architecture

- ✅ **Modular Design** - Clean separation of concerns following Flask best practices
- ✅ **Application Factory Pattern** - Easy testing and configuration management
- ✅ **Service Layer** - Business logic separated from routes
- ✅ **Configuration Management** - Environment-based configuration

### Functionality

- ✅ **Cold Start Detection** - Detects if Cursor needs to be launched and waits appropriately
- ✅ **Intelligent Polling** - No blind waits! Polls every 100-200ms to check actual status:
  - Cursor startup detection
  - Window responsiveness verification
  - File loading confirmation
- ✅ **Consecutive Check Validation** - Requires 3 consecutive successful checks to confirm Cursor is ready
- ✅ **Minimal Delays** - Only 0.3s UI settle time after file loads
- ✅ **Fast Hot Starts** - When Cursor is already running, proceeds immediately to file loading
- ✅ **Workspace-Aware** - Opens workspace/repo first, then the file (ensures correct project context)
- ✅ **Intelligent Window Focusing** - Matches by filename to find the correct Cursor window
- ✅ **Automatic Chat Opening** - Opens Cursor Chat with ESC + Ctrl+L
- ✅ **Automatic Pasting** - No manual paste needed
- ✅ **Optional Auto-Submit** - Can automatically submit the message with Enter
- ✅ **Detailed Logging** - Logs to console and `%TEMP%/cursor_listener.log` with timing information

## Configuration

You can customize server behavior using environment variables. Create a `.env` file in the `server` directory:

```ini
# Server settings
CURSOR_SERVER_HOST=127.0.0.1
CURSOR_SERVER_PORT=5050

# Cursor executable (if not in PATH, provide full path)
CURSOR_EXECUTABLE=cursor

# Timeout settings (in seconds)
CURSOR_STARTUP_TIMEOUT=15.0
CURSOR_READY_TIMEOUT=5.0
FILE_LOAD_TIMEOUT_HOT=8.0
FILE_LOAD_TIMEOUT_COLD=15.0
```

## Module Structure

- **`app/__init__.py`** - Application factory for Flask
- **`app/config.py`** - Centralized configuration with environment variable support
- **`app/routes/open_routes.py`** - API endpoint definitions
- **`app/services/cursor_service.py`** - Cursor IDE operations (open files, keyboard automation)
- **`app/services/window_service.py`** - Window management and polling
- **`app/services/clipboard_service.py`** - Clipboard operations
- **`app/services/message_service.py`** - Message handling and temp file operations
- **`app/utils/logger.py`** - Logging configuration

## Dependencies

- **flask** - Web framework
- **pyperclip** - Clipboard operations
- **pywin32** - Windows API access (window focusing and keyboard automation)
- **python-dotenv** - Environment variable management

## Troubleshooting

**Issue:** File opens but message doesn't paste

- **Cause:** Cursor wasn't fully loaded when paste was attempted
- **Solution:** The server now uses intelligent polling instead of flat waits:
  - Polls for Cursor startup (up to 15s)
  - Polls for window responsiveness (up to 8s with 3 consecutive checks)
  - Polls for file loading (up to 8-15s depending on cold/hot start)
  - Only uses minimal 0.3s UI settle time after confirmation

**Issue:** Still having paste issues

- **Check logs:** View `%TEMP%/cursor_listener.log` for detailed timing information
- **Look for:**
  - "Cursor started! (took X.Xs)" - How long startup took
  - "Cursor is responsive! (took X.Xs)" - How long until responsive
  - "File loaded! (took X.Xs)" - How long file loading took
- **Adjust if needed:** Increase `required_consecutive` in `wait_for_cursor_ready()` for stricter checks

**Issue:** Cursor window not found

- **Solution:** Ensure Cursor is in your PATH or update `CURSOR_EXECUTABLE_NAME` in the code

**Issue:** Process feels slow on cold starts

- **This is normal!** Cold starts can take 5-10 seconds, but the server now:
  - Reports exact timing in logs
  - Only waits as long as needed (no extra padding)
  - Proceeds immediately on hot starts (when Cursor is already running)
