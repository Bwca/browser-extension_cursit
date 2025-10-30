/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/extension-scripts/background.ts
 * Purpose: Extension service worker - handles messages and server communication
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

import { getBrowserAPI } from '../utils/browser-api-factory';

const browserAPI = getBrowserAPI();

browserAPI.runtimeOnMessageAddListener(async (request, sender, sendResponse) => {
  if (request.type === 'resolveComment' || request.type === 'executeInCursor') {
    try {
      const result = await browserAPI.storageLocalGet('repositories');
      console.log('CursIt-Extension: Searching for repository mapping...');
      const repositories = result.repositories || [];
      console.log('CursIt-Extension: Stored repositories:', JSON.stringify(repositories, null, 2));

      const requestRepoUrl = request.repoUrl;
      console.log('CursIt-Extension: Looking for URL from content script:', requestRepoUrl);

      const repo = repositories.find((r) => {
        let storedUrl = r.url;
        console.log(`CursIt-Extension: Processing stored URL: '${storedUrl}'`);

        if (storedUrl.endsWith('/')) {
          storedUrl = storedUrl.slice(0, -1);
        }
        if (storedUrl.endsWith('.git')) {
          storedUrl = storedUrl.slice(0, -4);
        }
        const isMatch = storedUrl === requestRepoUrl;
        console.log(
          `CursIt-Extension: Comparing normalized '${storedUrl}' with '${requestRepoUrl}'. Match: ${isMatch}`
        );
        return isMatch;
      });

      if (repo) {
        console.log('CursIt-Extension: Found matching repository:', JSON.stringify(repo, null, 2));
        const absolutePath = `${repo.path}/${request.filePath}`;

        // Determine if this is a simple file open (no comment/code) or a full operation
        const isSimpleFileOpen = !request.comment && !request.codeSnippet;
        const endpoint = isSimpleFileOpen
          ? 'http://localhost:5050/open-file'
          : 'http://localhost:5050/open';

        const data = isSimpleFileOpen
          ? {
              // Simple file open - no comment, no code snippet, no clipboard/paste operations
              filePath: absolutePath,
              workspacePath: repo.path,
            }
          : {
              // Full operation - open file AND paste to chat
              comment: request.comment,
              codeSnippet: request.codeSnippet,
              filePath: absolutePath,
              workspacePath: repo.path,
              autoSubmit: request.autoSubmit || false,
            };

        console.log(`CursIt-Extension: Preparing to send data to ${endpoint} (${request.type}):`);
        console.log(JSON.stringify(data, null, 2));

        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorMsg = `Server error: ${response.status} ${response.statusText}`;
            console.error('CursIt-Extension:', errorMsg);

            if (sender.tab?.id) {
              await browserAPI.showPageError(
                sender.tab.id,
                'Failed to send to Cursor. Is the server running?'
              );
            }
            throw new Error(errorMsg);
          }

          console.log('CursIt-Extension: Request sent successfully.');
          if (sender.tab?.id) {
            const successMessage = isSimpleFileOpen
              ? 'File opened in Cursor!'
              : 'Comment sent to Cursor!';
            await browserAPI.showPageSuccess(sender.tab.id, successMessage);
          }
        } catch (error) {
          console.error('CursIt-Extension: There was a problem sending the comment data:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

          if (sender.tab?.id) {
            await browserAPI.showPageError(
              sender.tab.id,
              `Failed to send to Cursor: ${errorMessage}. Is the server running?`
            );
          }
        }
      } else {
        const errorMsg = `No repository mapping found for ${requestRepoUrl}`;
        console.error('CursIt-Extension:', errorMsg);

        if (sender.tab?.id) {
          await browserAPI.showPageError(
            sender.tab.id,
            'Repository not configured. Click the extension icon to set it up.'
          );
        }
      }
    } catch (error) {
      console.error('CursIt-Extension: Unexpected error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      if (sender.tab?.id) {
        await browserAPI.showPageError(sender.tab.id, `Extension error: ${errorMessage}`);
      }
    }
  }
});
