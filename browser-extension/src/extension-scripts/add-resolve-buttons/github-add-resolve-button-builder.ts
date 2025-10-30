/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/extension-scripts/add-resolve-buttons/github-add-resolve-button-builder.ts
 * Purpose: GitHub-specific implementation for adding Cursor buttons to PR comments
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

import { AddResolveButtonBuilder } from './add-resolve-button-builder';

export class GitHubAddResolveButtonBuilder extends AddResolveButtonBuilder {
  constructor() {
    super();
    this.setCommentThreadSelector('.timeline-comment-group')
      .setCommentContentSelector('.comment-body')
      .setActionsSelector('.timeline-comment-actions')
      .setCodeSnippetSelector('.blob-code-inner')
      .setFilePathSelector('.file-header a[title]');
  }

  override getFilePath(thread: HTMLElement) {
    // Strategy 1: "Files changed" tab. Look for the file header.
    const fileElement = thread.closest('.file');
    if (fileElement) {
      const filePathElement = fileElement.querySelector(this.filePathSelector);
      if (filePathElement) {
        return (filePathElement as HTMLAnchorElement).title;
      }
    }

    // Strategies for "Conversation" tab
    const reviewThreadComponent = thread.closest('.review-thread-component');
    if (reviewThreadComponent) {
      // Strategy 2: Look for the file path in the comment summary link.
      const conversationFilePathElement =
        reviewThreadComponent.querySelector('summary a.Link--primary');
      if (
        conversationFilePathElement &&
        (conversationFilePathElement as HTMLAnchorElement)?.href.includes('/files')
      ) {
        return conversationFilePathElement.textContent.trim();
      }

      // Strategy 3: Look for hidden input field in suggestion forms.
      const suggestionForm = reviewThreadComponent.querySelector(
        'form.js-single-suggested-change-form'
      );
      if (suggestionForm) {
        const pathInput = suggestionForm.querySelector('input[name="path"]');
        if (pathInput) {
          return (pathInput as HTMLInputElement).value;
        }
      }
    }

    return '';
  }

  override getCodeSnippets(thread: HTMLElement) {
    const reviewThreadComponent = thread.closest('.review-thread-component');
    const codeSnippetElements = reviewThreadComponent
      ? reviewThreadComponent.querySelectorAll(this.codeSnippetSelector)
      : [];
    const codeSnippets = Array.from(codeSnippetElements).map((el) => el.textContent);
    return codeSnippets.join('\n\n');
  }

  override getRepoUrl() {
    // For GitHub: https://github.com/owner/repo/pull/123 -> https://github.com/owner/repo
    const pathSegments = window.location.pathname.split('/');
    const repoUrl = `${window.location.protocol}//${window.location.hostname}${pathSegments
      .slice(0, 3)
      .join('/')}`;
    console.log('CursIt-Extension: GitHub repo URL:', repoUrl);
    return repoUrl;
  }

  override addOpenInCursorButton() {
    // Strategy 1: Add buttons to file headers in "Files changed" tab
    const fileHeaders = document.querySelectorAll('.file-header');
    console.log(`CursIt-Extension: Found ${fileHeaders.length} file headers in GitHub`);

    fileHeaders.forEach((fileHeader, index) => {
      // Check if button already exists
      const existingButton = fileHeader.querySelector('.open-in-cursor-btn');
      if (existingButton) {
        return;
      }

      // Get file path
      const filePathElement = fileHeader.querySelector('a[title]');
      if (!filePathElement) {
        console.log(`CursIt-Extension: File header ${index} - No file path element found`);
        return;
      }

      const filePath = (filePathElement as HTMLAnchorElement).title;

      // Create "Open in Cursor" button
      const button = document.createElement('button');
      button.textContent = 'Open in Cursor';
      button.className = 'open-in-cursor-btn';
      button.style.cssText =
        'margin-left: 8px; padding: 4px 12px; background: #8b5cf6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;';

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

      // Find the file info section (where the file name is displayed)
      const fileInfo = fileHeader.querySelector('.file-info');
      if (fileInfo) {
        fileInfo.appendChild(button);
        console.log(`CursIt-Extension: File header ${index} - Open in Cursor button added!`);
      } else {
        // Fallback: append to file header itself
        fileHeader.appendChild(button);
        console.log(
          `CursIt-Extension: File header ${index} - Open in Cursor button added (fallback)!`
        );
      }
    });

    // Strategy 2: Add buttons to conversation tab file links
    const conversationFileLinks = document.querySelectorAll(
      '.review-thread-component summary a.Link--primary'
    );
    console.log(
      `CursIt-Extension: Found ${conversationFileLinks.length} file links in conversation tab`
    );

    conversationFileLinks.forEach((linkElement, index) => {
      const link = linkElement as HTMLAnchorElement;
      if (!link.href.includes('/files')) {
        return;
      }

      // Check if button already exists
      const parent = link.parentElement;
      if (!parent) return;

      const existingButton = parent.querySelector('.open-in-cursor-btn-inline');
      if (existingButton) {
        return;
      }

      const filePath = link.textContent?.trim();

      // Create inline button with full text
      const button = document.createElement('button');
      button.textContent = 'Open in Cursor';
      button.className = 'open-in-cursor-btn-inline';
      button.style.cssText =
        'margin-left: 8px; padding: 4px 8px; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 500; vertical-align: middle;';

      button.onclick = (e) => {
        e.stopPropagation(); // Prevent summary toggle
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

      link.after(button);
      console.log(`CursIt-Extension: Conversation link ${index} - Open in Cursor button added!`);
    });
  }
}
