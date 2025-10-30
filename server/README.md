# CursIt HTTP Server (Python/Flask)

A sophisticated, modular Flask-based HTTP server infrastructure that orchestrates seamless integration with Cursor IDE, facilitating automated file operations and pull request commentary transfer to Cursor Chat.

## Architectural Framework

The application adheres to Flask best practices, employing a pristine, modular architecture:

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

## Installation Procedure

```bash
pip install -r requirements.txt
```

Alternatively, install dependencies individually:

```bash
pip install flask pyperclip pywin32 python-dotenv
```

## Server Initialization

```bash
python run.py
```

The server daemon shall commence operations at `http://localhost:5050/open`

## API Endpoints

### POST `/open` - Open File with Comment/Chat Integration

Opens a file in Cursor IDE and pastes comment/code into the chat interface.

Accepts POST requests with JSON payload specification:

```json
{
  "workspacePath": "C:\\path\\to\\workspace",
  "filePath": "C:\\path\\to\\workspace\\file.py",
  "comment": "Your comment here",
  "codeSnippet": "def foo(): pass",
  "autoSubmit": false
}
```

**Parameter Specification:**

- `filePath` (required): Complete filesystem path to the designated file
- `workspacePath` (discretionary, recommended): Complete path to workspace/repository root
- `comment` (discretionary): Commentary or inquiry to transmit
- `codeSnippet` (discretionary): Code fragment for inclusion
- `autoSubmit` (discretionary, default: `false`): When `true`, autonomously submits message via Enter key

**Execution Sequence:**

1. Validates file existence within filesystem
2. **Detects Cursor operational status (cold start intelligence)**
3. **Materializes workspace/repository within Cursor (if `workspacePath` provided), subsequently opening designated file**
   - Ensures file materialization within appropriate project context
   - Prevents file opening within unrelated Cursor instances
4. **Cold start scenario:**
   - Polls at 200ms intervals for Cursor initialization (maximum 15s)
   - Polls at 200ms intervals for Cursor responsiveness (maximum 8s)
   - Employs consecutive verification checks to confirm readiness
5. **Hot start scenario:** Proceeds immediately to file loading operations
6. Synthesizes commentary and code snippet into unified message
7. Persists message to temporary file: `%TEMP%/cursor_received_message.txt`
8. Transfers message to system clipboard
9. **Polls window titles at 100ms intervals** to detect file loading completion (8-15s timeout)
10. Observes 0.3s interval for UI stabilization
11. **Identifies and focuses Cursor window containing designated file**
12. **Activates Cursor Chat interface (ESC + Ctrl+L)**
13. **Automatically populates chat input with message content (Ctrl+V)**
14. Autonomous mode (`autoSubmit=true`): **Automatically submits via Enter key**
15. Curator mode (`autoSubmit=false`, default): User reviews prior to manual submission
16. Returns JSON response payload

**Response Format Specification:**

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

Autonomous mode note displays: `"...pasted and submitted."`

### POST `/open-file` - Simple File Opening

Opens a file in Cursor IDE WITHOUT any clipboard, chat, or paste operations. This is a clean file opening operation with no side effects.

Accepts POST requests with JSON payload specification:

```json
{
  "workspacePath": "C:\\path\\to\\workspace",
  "filePath": "C:\\path\\to\\workspace\\file.py"
}
```

**Parameter Specification:**

- `filePath` (required): Complete filesystem path to the designated file
- `workspacePath` (discretionary, recommended): Complete path to workspace/repository root

**Execution Sequence:**

1. Validates file existence within filesystem
2. Opens workspace/repository in Cursor (if `workspacePath` provided)
3. Opens the designated file
4. **No clipboard operations**
5. **No chat activation**
6. **No paste operations**
7. Returns JSON response payload

**Response Format Specification:**

```json
{
  "status": "ok",
  "openedWorkspace": "C:\\full\\path\\to\\workspace",
  "openedFile": "C:\\full\\path\\to\\workspace\\file.py",
  "note": "File opened in Cursor"
}
```

**Use Cases:**

- Quick file navigation from pull request file headers
- Opening files without comment context
- Direct file access buttons in browser extensions
- Any scenario where clipboard/chat operations are undesired

## Distinguished Capabilities

### Architectural Excellence

- ✅ **Modular Architecture** - Pristine separation of concerns adhering to Flask best practices
- ✅ **Application Factory Pattern** - Facilitates testing and configuration orchestration
- ✅ **Service Layer Abstraction** - Business logic architecturally separated from routing infrastructure
- ✅ **Configuration Orchestration** - Environment-based configuration management

### Operational Sophistication

- ✅ **Cold Start Intelligence** - Autonomously detects Cursor launch requirements and accommodates appropriately
- ✅ **Adaptive Polling Mechanism** - Eliminates presumptive delays through 100-200ms interval status verification:
  - Cursor initialization detection
  - Window responsiveness authentication
  - File loading confirmation
- ✅ **Consecutive Verification Protocol** - Requires three consecutive successful checks for Cursor readiness confirmation
- ✅ **Optimized Latency** - Employs only 0.3s UI stabilization interval post-loading
- ✅ **Expedited Hot Starts** - Immediate file loading progression when Cursor is operational
- ✅ **Context-Preserving Operations** - Initializes workspace/repository prior to file materialization (ensures contextual integrity)
- ✅ **Intelligent Window Identification** - Filename-based matching for precise Cursor window location
- ✅ **Automated Chat Activation** - Programmatic Cursor Chat opening via ESC + Ctrl+L
- ✅ **Automated Content Population** - Eliminates manual paste requirements
- ✅ **Configurable Submission Behavior** - Discretionary automatic message submission capability
- ✅ **Comprehensive Instrumentation** - Console and `%TEMP%/cursor_listener.log` logging with temporal analytics

## Configuration Protocol

Server behavior may be customized through environment variables. Establish a `.env` configuration file within the `server` directory:

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

## Modular Architecture

- **`app/__init__.py`** - Flask application factory
- **`app/config.py`** - Centralized configuration with environment variable integration
- **`app/routes/open_routes.py`** - API endpoint specifications
- **`app/services/cursor_service.py`** - Cursor IDE orchestration (file operations, keyboard automation)
- **`app/services/window_service.py`** - Window management and polling infrastructure
- **`app/services/clipboard_service.py`** - Clipboard operation services
- **`app/services/message_service.py`** - Message handling and temporary file operations
- **`app/utils/logger.py`** - Logging infrastructure configuration

## Dependency Framework

- **flask** - Enterprise web framework
- **pyperclip** - Clipboard manipulation library
- **pywin32** - Windows API integration (window focus management and keyboard automation)
- **python-dotenv** - Environment variable orchestration

## Diagnostic Resolution

**Issue:** File Materialization Without Message Transfer

- **Etiology:** Cursor IDE initialization incomplete during paste operation
- **Resolution:** Server employs intelligent polling mechanisms rather than presumptive delays:
  - Cursor initialization polling (maximum 15s)
  - Window responsiveness polling (maximum 8s with 3 consecutive verification checks)
  - File loading polling (8-15s contingent upon cold/hot start scenario)
  - Minimal 0.3s UI stabilization interval post-confirmation

**Issue:** Persistent Message Transfer Difficulties

- **Diagnostic Procedure:** Consult `%TEMP%/cursor_listener.log` for comprehensive temporal analytics
- **Key Indicators:**
  - "Cursor started! (took X.Xs)" - Initialization duration
  - "Cursor is responsive! (took X.Xs)" - Responsiveness acquisition timeline
  - "File loaded! (took X.Xs)" - File loading completion duration
- **Remediation:** Increment `required_consecutive` parameter within `wait_for_cursor_ready()` for enhanced verification rigor

**Issue:** Cursor Window Detection Failure

- **Resolution:** Verify Cursor executable accessibility via system PATH, or update `CURSOR_EXECUTABLE_NAME` parameter

**Issue:** Cold Start Latency Perception

- **Explanation:** Cold start operations naturally require 5-10 seconds. The server architecture now:
  - Reports precise temporal metrics within logs
  - Observes only requisite waiting intervals (eliminates superfluous padding)
  - Proceeds immediately during hot start scenarios (when Cursor is operational)
