# CursItChromeExtension

Browser extension that integrates GitHub/Azure DevOps PR comments with Cursor IDE.

## Features

### Two Button Types:

1. **Take to Cursor** (Blue button)
   - Always visible on all PR comments
   - Opens the file in Cursor
   - Pastes the full comment + code snippets into chat
   - **Manual submission** - you review and press Enter

2. **Execute in Cursor** (Green button)
   - Only appears when comment summary contains "Prompt for AI Agents"
   - Opens the file in Cursor
   - Extracts only the adjacent code block (not the file path or full comment)
   - Pastes concise command into chat
   - **Auto-submits immediately** - executes right away

### Supported Platforms:

- GitHub Pull Requests
- Azure DevOps Pull Requests

## Setup

1. Configure repository mappings in the extension popup
2. Map repo URLs to local file paths
3. Ensure the Python server is running at `http://localhost:5050`

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
