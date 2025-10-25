/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/extension-scripts/content.ts
 * Purpose: Content script - injects buttons on PR pages and handles UI interactions
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

import { getBuilder } from './add-resolve-buttons/get-builder';
import { showPageNotification } from './utils/page-notification';
import { getBrowserAPI } from '../utils/browser-api-factory';

const browserAPI = getBrowserAPI();

console.log('CursIt-Extension: Content script loaded!', window.location.href);

try {
  const builder = getBuilder();

  if (builder) {
    const addResolveButtonToComments = builder.build();

    const observer = new MutationObserver(() => {
      try {
        addResolveButtonToComments();
      } catch (error) {
        console.error('CursIt-Extension: Error in MutationObserver callback:', error);
        showPageNotification(
          `Failed to add resolve buttons: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
          'error',
        );
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    addResolveButtonToComments();
  } else {
    console.warn('CursIt-Extension: No builder found for this page:', window.location.hostname);
    // Don't show notification for unsupported pages - this is expected behavior
  }
} catch (error) {
  console.error('CursIt-Extension: Fatal error in content script:', error);
  showPageNotification(
    `Extension failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`,
    'error',
  );
}

// Listen for notification messages from background script
browserAPI.runtimeOnMessageAddListener((request, sender, sendResponse) => {
  if (request.type === 'showError') {
    showPageNotification(request.message, 'error');
  } else if (request.type === 'showSuccess') {
    showPageNotification(request.message, 'success');
  } else if (request.type === 'showInfo') {
    showPageNotification(request.message, 'info');
  } else if (request.type === 'showWarning') {
    showPageNotification(request.message, 'warning');
  }
});
