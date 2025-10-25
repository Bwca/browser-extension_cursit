# CursIt Browser Extension

A sophisticated browser extension facilitating seamless integration between GitHub/Azure DevOps pull request commentary and Cursor IDE.

## Distinguished Capabilities

### Dual-Mode Interface Architecture:

1. **Curator Mode** (Azure Button)

   - Perpetually accessible across all pull request commentary
   - Materializes the designated file within Cursor IDE
   - Transfers comprehensive comment text and code fragments to chat interface
   - **Deliberate submission protocol** - Manual review and confirmation required

2. **Autonomous Execution Mode** (Verdant Button)
   - Manifests exclusively when commentary contains "Prompt for AI Agents" designation
   - Materializes the designated file within Cursor IDE
   - Extracts exclusively the adjacent code block, excluding file path references
   - Populates chat with concise directive
   - **Immediate automatic submission** - Executes without intermediary review

### Platform Compatibility:

- GitHub Pull Request Infrastructure
- Azure DevOps Pull Request Ecosystem

## Configuration Protocol

1. Establish repository mappings via the extension interface
2. Configure correspondence between repository URLs and local filesystem hierarchies
3. Verify Python server daemon operation at `http://localhost:5050`

## Development Infrastructure

To initialize the local development server, execute:

```bash
ng serve
```

Upon successful initialization, navigate to `http://localhost:4200/` within your browser. The application incorporates automatic reload capabilities upon source file modifications.

## Code Generation

Angular CLI provides comprehensive scaffolding capabilities. To generate a component architecture, execute:

```bash
ng generate component component-name
```

For a complete enumeration of available schematics (components, directives, pipes, et cetera), consult:

```bash
ng generate --help
```

## Production Compilation

To compile the project for production deployment:

```bash
ng build
```

This operation compiles your project and deposits build artifacts within the `dist/` directory. The production build configuration automatically optimizes for performance and operational efficiency.

## Supplementary Resources

For comprehensive information regarding Angular CLI utilization, including detailed command references, consult the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) documentation.
