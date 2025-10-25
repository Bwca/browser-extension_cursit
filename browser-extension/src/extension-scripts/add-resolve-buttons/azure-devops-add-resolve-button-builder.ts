import { AddResolveButtonBuilder } from './add-resolve-button-builder';

export class AzureDevOpsAddResolveButtonBuilder extends AddResolveButtonBuilder {
  constructor() {
    super();
    this.setCommentThreadSelector('.repos-discussion-comment')
      .setCommentContentSelector('.markdown-content.markdown-editor-preview')
      .setActionsSelector('.repos-discussion-comment-header');
  }

  override getFilePath(thread: HTMLElement) {
    // Strategy 1: Look for file path in the comment file header (most reliable)
    // Azure DevOps shows the file path at the top of the comment thread
    const commentViewer = thread.closest('.repos-comment-viewer');
    if (commentViewer) {
      // Look upward for the file header container - go through multiple parent levels
      let currentElement = commentViewer.parentElement;
      let attempts = 0;
      const maxAttempts = 5; // Limit how far we search upward

      while (currentElement && attempts < maxAttempts) {
        // Look for the file path span in the current level and all descendants
        const filePathSpan = currentElement.querySelector(
          'span.body-s.secondary-text.text-ellipsis'
        );
        if (filePathSpan) {
          const filePath = filePathSpan.textContent?.trim();
          // Clean up the path - remove "== $0" or other debug artifacts
          const cleanPath = filePath?.replace(/^==\s*\$\d+\s*["\']?|["\']$/g, '').trim();
          if (cleanPath && cleanPath.includes('/')) {
            console.log('CursIt-Extension: Found file path in file header:', cleanPath);
            return cleanPath;
          }
        }

        // Also check for comment-file-header specifically
        const fileHeader = currentElement.querySelector('.comment-file-header');
        if (fileHeader) {
          const filePathSpan2 = fileHeader.querySelector(
            'span.body-s.secondary-text.text-ellipsis, span.body-s.secondary-text'
          );
          if (filePathSpan2) {
            const filePath = filePathSpan2.textContent?.trim();
            const cleanPath = filePath?.replace(/^==\s*\$\d+\s*["\']?|["\']$/g, '').trim();
            if (cleanPath && cleanPath.includes('/')) {
              console.log('CursIt-Extension: Found file path in comment-file-header:', cleanPath);
              return cleanPath;
            }
          }
        }

        currentElement = currentElement.parentElement;
        attempts++;
      }
    }

    // Strategy 2: Look for the file path in the "🤖 Prompt for AI Agents" section
    // The path typically starts with "In" followed by the file path
    const codeBlocks = thread.querySelectorAll('pre.hljs code');
    console.log(`CursIt-Extension: Found ${codeBlocks.length} code blocks to search for file path`);

    for (let i = 0; i < codeBlocks.length; i++) {
      const codeBlock = codeBlocks[i];
      const text = codeBlock.textContent.trim();
      console.log(`CursIt-Extension: Code block ${i} starts with:`, text.substring(0, 100));

      // Check if this code block contains file path information (starts with "In ")
      if (text.startsWith('In ') || text.startsWith('In\n')) {
        const lines = text.split('\n');
        console.log(`CursIt-Extension: Found "In" block with ${lines.length} lines`);

        // Strategy 2a: "In <path>" on the same line
        const firstLine = lines[0].trim();
        const pathMatch = firstLine.match(/^In\s+(.+?)(?:\s|$)/);
        if (pathMatch && pathMatch[1]) {
          let filePath = pathMatch[1].trim();
          // Remove any trailing punctuation or "around lines" text if present
          if (/\s+(around|at|on)\s+(lines?|line)/i.test(filePath)) {
            filePath = filePath.replace(/[,;:]?\s+(around|at|on)\s+(lines?|line).*/i, '').trim();
          }
          if (filePath && filePath.includes('/')) {
            console.log('CursIt-Extension: Found file path (strategy 2a):', filePath);
            return filePath;
          }
        }

        // Strategy 2b: "In" on first line, path on second line
        if (firstLine === 'In' && lines.length > 1) {
          const secondLine = lines[1].trim();
          console.log('CursIt-Extension: Second line:', secondLine);
          if (secondLine && secondLine.includes('/')) {
            // Extract just the file path, removing "around lines" text if present
            // Only apply the regex if we actually have those keywords
            let cleanPath = secondLine;
            if (/\s+(around|at|on)\s+(lines?|line)/i.test(secondLine)) {
              cleanPath = secondLine
                .replace(/[,;:]?\s+(around|at|on)\s+(lines?|line).*/i, '')
                .trim();
            }
            console.log('CursIt-Extension: Found file path (strategy 2b):', cleanPath);
            return cleanPath;
          }
        }
      }
    }

    // Strategy 3: Look for data attributes
    if (commentViewer) {
      const fileInfoElements = commentViewer.querySelectorAll('[data-file-path], [title*="/"]');
      console.log(
        `CursIt-Extension: Searching ${fileInfoElements.length} elements with data-file-path or title attributes`
      );
      for (const element of fileInfoElements) {
        const filePath = element.getAttribute('data-file-path') || element.getAttribute('title');
        if (filePath && filePath.includes('/')) {
          console.log('CursIt-Extension: Found file path in data attributes:', filePath);
          return filePath;
        }
      }
    }

    console.warn('CursIt-Extension: Could not extract file path from Azure DevOps comment.');
    return '';
  }

  override getCodeSnippets(thread: HTMLElement) {
    // Extract all code snippets from pre.hljs code blocks
    const codeBlocks = thread.querySelectorAll('pre.hljs code');
    const codeSnippets: string[] = [];

    for (const codeBlock of codeBlocks) {
      const text = codeBlock.textContent.trim();
      // Skip the AI prompt block (usually starts with "In ")
      if (text.startsWith('In ') || text.startsWith('In\n')) {
        continue;
      }
      // Add the code snippet if it's not empty
      if (text) {
        codeSnippets.push(text);
      }
    }

    if (codeSnippets.length > 0) {
      console.log(
        `CursIt-Extension: Extracted ${codeSnippets.length} code snippet(s) from Azure DevOps comment.`
      );
      return codeSnippets.join('\n\n---\n\n');
    }

    console.log('CursIt-Extension: No code snippets found in Azure DevOps comment.');
    return '';
  }

  override getRepoUrl() {
    // For Azure DevOps: https://dev.azure.com/org/project/_git/repo/pullrequest/123
    //                -> https://dev.azure.com/org/project/_git/repo
    const pathSegments = window.location.pathname.split('/');
    // Path structure: ['', 'org', 'project', '_git', 'repo', 'pullrequest', '123']
    // We need up to index 4 (inclusive): ['', 'org', 'project', '_git', 'repo']
    const repoUrl = `${window.location.protocol}//${window.location.hostname}${pathSegments
      .slice(0, 5)
      .join('/')}`;
    console.log('CursIt-Extension: Azure DevOps repo URL:', repoUrl);
    return repoUrl;
  }
}
