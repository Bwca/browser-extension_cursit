import { getBrowserAPI } from '../../utils/browser-api-factory';

export class AddResolveButtonBuilder {
  commentThreadSelector: string;
  commentContentSelector: string;
  actionsSelector: string;
  codeSnippetSelector: string;
  filePathSelector: string;
  buttonClass: string;
  buttonText: string;
  protected browserAPI = getBrowserAPI();

  constructor() {
    this.commentThreadSelector = '';
    this.commentContentSelector = '';
    this.actionsSelector = '';
    this.codeSnippetSelector = '';
    this.filePathSelector = '';
    this.buttonClass = 'resolve-in-cursor-btn';
    this.buttonText = 'Take to Cursor';
  }

  setCommentThreadSelector(selector: string) {
    this.commentThreadSelector = selector;
    return this;
  }

  setCommentContentSelector(selector: string) {
    this.commentContentSelector = selector;
    return this;
  }

  setActionsSelector(selector: string) {
    this.actionsSelector = selector;
    return this;
  }

  setCodeSnippetSelector(selector: string) {
    this.codeSnippetSelector = selector;
    return this;
  }

  setFilePathSelector(selector: string) {
    this.filePathSelector = selector;
    return this;
  }

  getFilePath(thread: HTMLElement) {
    return '';
  }

  getCodeSnippets(thread: HTMLElement) {
    return '';
  }

  getRepoUrl() {
    // Override this in subclasses for platform-specific repo URL extraction
    return '';
  }

  cleanCommentText(htmlContent: string) {
    // Simple, robust approach: remove UI junk and extract text
    const temp = document.createElement('div');
    temp.innerHTML = htmlContent;

    // Remove all interactive/UI elements and redundant sections
    temp
      .querySelectorAll(
        'button, script, style, svg, .copy-btn, .copy-btn-container, .copy-btn-tooltip'
      )
      .forEach((el: any) => el.remove());

    // Remove Azure DevOps-specific UI sections that duplicate content
    temp
      .querySelectorAll('details, .repos-summary-code-diff, .screen-reader-only')
      .forEach((el: any) => el.remove());

    // Get text and clean up excessive whitespace
    let text = temp.textContent || '';

    // Remove multiple consecutive blank lines (keep max 2)
    text = text.replace(/\n\s*\n\s*\n\s*\n/g, '\n\n');

    // Trim whitespace from each line
    text = text
      .split('\n')
      .map((line: string) => line.trim())
      .join('\n');

    return text.trim();
  }

  hasAIPrompt(thread: HTMLElement): boolean {
    // Check if summary contains "Prompt for AI Agents"
    const summary = thread.querySelector('summary');
    if (summary && summary.textContent?.includes('Prompt for AI Agents')) {
      return true;
    }
    // Also check in headings and other text
    const textContent = thread.textContent || '';
    return textContent.includes('Prompt for AI Agents');
  }

  getAdjacentCodeBlock(thread: HTMLElement): string {
    // Find the first pre code element
    const codeBlocks = thread.querySelectorAll('pre code, pre.hljs code');
    for (const codeBlock of codeBlocks) {
      const text = (codeBlock.textContent || '').trim();

      if (text) {
        // If the block starts with "In <path>", extract everything AFTER the first line
        if (text.startsWith('In ') || text.startsWith('In\n')) {
          const lines = text.split('\n');
          // Skip the first line (the "In <path>" line) and get the rest
          const instruction = lines.slice(1).join('\n').trim();
          if (instruction) {
            console.log('CursIt-Extension: Found instruction in AI prompt block (after file path)');
            return instruction;
          }
        } else {
          // This is a standalone code block without file path
          console.log('CursIt-Extension: Found standalone code block for execution');
          return text;
        }
      }
    }
    console.log('CursIt-Extension: No code block found');
    return '';
  }

  build() {
    return () => {
      const commentThreads = document.querySelectorAll(
        this.commentThreadSelector
      ) as NodeListOf<HTMLElement>;
      console.log(
        `CursIt-Extension: Found ${commentThreads.length} comment threads with selector "${this.commentThreadSelector}"`
      );

      commentThreads.forEach((thread, index) => {
        const commentContent = thread.querySelector(this.commentContentSelector);
        console.log(`CursIt-Extension: Thread ${index} - Found comment content:`, !!commentContent);

        const existingButton = thread.querySelector(`.${this.buttonClass}`);
        console.log(
          `CursIt-Extension: Thread ${index} - Already has resolve button:`,
          !!existingButton
        );

        const actions = thread.querySelector(this.actionsSelector);

        // Add "Resolve in Cursor" button
        if (commentContent && !existingButton) {
          // Get file path once when adding the button
          const filePath = this.getFilePath(thread);
          console.log(
            `CursIt-Extension: Thread ${index} - Found file path: ${filePath || '(none)'}`
          );

          // Only add button if we have a valid file path
          if (!filePath) {
            console.log(`CursIt-Extension: Thread ${index} - Skipping button (no file path found)`);
            return;
          }

          const button = document.createElement('button');
          button.textContent = this.buttonText;
          button.className = this.buttonClass;
          button.style.cssText =
            'margin-left: 8px; padding: 4px 12px; background: #0078d4; color: white; border: none; border-radius: 2px; cursor: pointer; font-size: 12px;';

          // Store file path as data attribute
          button.setAttribute('data-file-path', filePath);

          button.addEventListener('click', () => {
            const commentText = this.cleanCommentText(commentContent.innerHTML);
            const codeSnippet = this.getCodeSnippets(thread);
            // Get stored file path from data attribute (always present since we check before adding button)
            const storedFilePath = button.getAttribute('data-file-path')!;
            const repoUrl = this.getRepoUrl();

            const data = {
              type: 'resolveComment' as const,
              comment: commentText,
              codeSnippet: codeSnippet,
              filePath: storedFilePath,
              repoUrl: repoUrl,
              autoSubmit: false,
            };

            console.log('Sending data from content script (Resolve):');
            console.log(JSON.stringify(data, null, 2));

            this.browserAPI.runtimeSendMessage(data);
          });

          console.log(
            `CursIt-Extension: Thread ${index} - Found actions area with selector "${this.actionsSelector}":`,
            !!actions
          );

          if (actions) {
            actions.appendChild(button);
            console.log(`CursIt-Extension: Thread ${index} - Resolve button added successfully!`);
          } else {
            console.warn(
              `CursIt-Extension: Thread ${index} - Could not find actions area to append button`
            );
          }
        }

        // Add "Execute in Cursor" button if AI Prompt is detected
        // This button should be placed next to the summary element
        // Find ALL summary elements with "Prompt for AI Agents"
        if (commentContent) {
          const summaries = thread.querySelectorAll('summary');

          summaries.forEach((summary, summaryIndex) => {
            if (summary.textContent?.includes('Prompt for AI Agents')) {
              // Check if this specific summary already has an execute button
              const existingExecuteButton = summary.querySelector('.execute-in-cursor-btn');

              if (!existingExecuteButton) {
                // Get file path once when adding the button
                const threadFilePath = this.getFilePath(thread);
                console.log(
                  `CursIt-Extension: Thread ${index}, Summary ${summaryIndex} - Found file path: ${
                    threadFilePath || '(none)'
                  }`
                );

                // Only add execute button if we have a valid file path
                if (!threadFilePath) {
                  console.log(
                    `CursIt-Extension: Thread ${index}, Summary ${summaryIndex} - Skipping execute button (no file path found)`
                  );
                  return;
                }

                const executeButton = document.createElement('button');
                executeButton.textContent = 'Execute in Cursor';
                executeButton.className = 'execute-in-cursor-btn';
                executeButton.style.cssText =
                  'margin-left: 12px; padding: 4px 12px; background: #107c10; color: white; border: none; border-radius: 2px; cursor: pointer; font-size: 12px; vertical-align: middle;';

                // Store file path as data attribute
                executeButton.setAttribute('data-file-path', threadFilePath);

                executeButton.addEventListener('click', (e) => {
                  e.stopPropagation(); // Prevent summary toggle

                  // Get the parent details element - code block should be right inside it
                  const detailsElement = summary.closest('details');

                  if (!detailsElement) {
                    console.error('CursIt-Extension: Could not find parent details element.');
                    alert('Could not find code block container.');
                    return;
                  }

                  // Find the code block within this specific details element
                  const codeBlockElement = detailsElement.querySelector('pre code, pre.hljs code');

                  if (!codeBlockElement) {
                    console.error('CursIt-Extension: No code block found in details element.');
                    alert('No code block found to execute.');
                    return;
                  }

                  let codeBlock = (codeBlockElement.textContent || '').trim();
                  let filePath = '';

                  // If the block starts with "In <path>", extract the file path AND instruction
                  if (codeBlock.startsWith('In ') || codeBlock.startsWith('In\n')) {
                    const lines = codeBlock.split('\n');
                    const firstLine = lines[0].trim();

                    // Extract file path from "In <path>" line
                    const pathMatch = firstLine.match(/^In\s+(.+?)(?:\s+around|\s+at|,|$)/);
                    if (pathMatch && pathMatch[1]) {
                      filePath = pathMatch[1].trim();
                      console.log(
                        'CursIt-Extension: Extracted file path from code block:',
                        filePath
                      );
                    }

                    // Extract instruction (everything after first line)
                    codeBlock = lines.slice(1).join('\n').trim();
                  }

                  // Use stored file path if not found in code block (always present since we check before adding button)
                  if (!filePath) {
                    filePath = executeButton.getAttribute('data-file-path')!;
                    console.log('CursIt-Extension: Using stored file path:', filePath);
                  }

                  const repoUrl = this.getRepoUrl();

                  console.log(
                    `CursIt-Extension: Execute button clicked (Thread ${index}, Summary ${summaryIndex})`
                  );
                  console.log('Code block extracted:', codeBlock.substring(0, 100) + '...');
                  console.log('File path:', filePath);

                  if (!codeBlock) {
                    console.error('CursIt-Extension: No code block found to execute.');
                    alert('No code block found to execute.');
                    return;
                  }

                  const data = {
                    type: 'executeInCursor' as const,
                    comment: codeBlock, // Use ONLY the code block as the comment
                    codeSnippet: '', // No additional code snippet
                    filePath: filePath,
                    repoUrl: repoUrl,
                    autoSubmit: true, // Auto-submit for execution
                  };

                  console.log('Sending data from content script (Execute):');
                  console.log(JSON.stringify(data, null, 2));

                  this.browserAPI.runtimeSendMessage(data);
                });

                // Append button right inside the summary element
                summary.appendChild(executeButton);
                console.log(
                  `CursIt-Extension: Thread ${index}, Summary ${summaryIndex} - Execute button added!`
                );
              }
            }
          });
        }
      });
    };
  }
}
