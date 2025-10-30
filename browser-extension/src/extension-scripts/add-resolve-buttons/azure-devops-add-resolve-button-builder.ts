/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/extension-scripts/add-resolve-buttons/azure-devops-add-resolve-button-builder.ts
 * Purpose: Azure DevOps-specific implementation for adding Cursor buttons to PR comments
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

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

  override addOpenInCursorButton() {
    // Strategy 1: Add buttons to file headers in the file diff sections
    const fileHeaders = document.querySelectorAll('.comment-file-header');
    console.log(`CursIt-Extension: Found ${fileHeaders.length} file headers in Azure DevOps`);

    fileHeaders.forEach((fileHeader, index) => {
      // Check if button already exists
      const existingButton = fileHeader.querySelector('.open-in-cursor-btn');
      if (existingButton) {
        return;
      }

      // Get file path from the file header
      const filePathSpan = fileHeader.querySelector(
        'span.body-s.secondary-text.text-ellipsis, span.body-s.secondary-text'
      );
      if (!filePathSpan) {
        console.log(`CursIt-Extension: File header ${index} - No file path element found`);
        return;
      }

      const filePath = filePathSpan.textContent?.trim();
      if (!filePath) {
        console.log(`CursIt-Extension: File header ${index} - Empty file path`);
        return;
      }

      // Create "Open in Cursor" button
      const button = document.createElement('button');
      button.textContent = 'Open in Cursor';
      button.className = 'open-in-cursor-btn';
      button.style.cssText =
        'margin-left: 12px; padding: 4px 12px; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;';

      button.onclick = () => {
        const repoUrl = this.getRepoUrl();

        const data = {
          type: 'resolveComment' as const,
          comment: '', // No comment text for direct file open
          codeSnippet: '', // No code snippet
          filePath: filePath,
          repoUrl: repoUrl,
          autoSubmit: true, // Auto-submit to just open the file
        };

        console.log('Sending data from content script (Open in Cursor):');
        console.log(JSON.stringify(data, null, 2));

        this.browserAPI.runtimeSendMessage(data);
      };

      // Append button to the file header
      fileHeader.appendChild(button);
      console.log(`CursIt-Extension: File header ${index} - Open in Cursor button added!`);
    });

    // Strategy 2: Add buttons to standalone file path displays (if any exist outside comment threads)
    const filePathElements = document.querySelectorAll(
      'span.body-s.secondary-text.text-ellipsis:not(.open-in-cursor-processed)'
    );
    console.log(`CursIt-Extension: Found ${filePathElements.length} potential file path elements`);

    filePathElements.forEach((element, index) => {
      const filePath = element.textContent?.trim();
      if (!filePath) {
        return;
      }

      // Mark as processed
      element.classList.add('open-in-cursor-processed');

      // Check if button already exists
      const parent = element.parentElement;
      if (!parent) return;

      const existingButton = parent.querySelector('.open-in-cursor-btn-inline');
      if (existingButton) {
        return;
      }

      // Create inline button with full text
      const button = document.createElement('button');
      button.textContent = 'Open in Cursor';
      button.className = 'open-in-cursor-btn-inline';
      button.style.cssText =
        'margin-left: 8px; padding: 4px 8px; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 500; vertical-align: middle;';

      button.onclick = (e) => {
        e.stopPropagation();
        const repoUrl = this.getRepoUrl();

        const data = {
          type: 'resolveComment' as const,
          comment: '',
          codeSnippet: '',
          filePath: filePath,
          repoUrl: repoUrl,
          autoSubmit: true,
        };

        console.log('Sending data from content script (Open in Cursor - inline):');
        console.log(JSON.stringify(data, null, 2));

        this.browserAPI.runtimeSendMessage(data);
      };

      element.after(button);
      console.log(`CursIt-Extension: File path element ${index} - Open in Cursor button added!`);
    });
  }
}
