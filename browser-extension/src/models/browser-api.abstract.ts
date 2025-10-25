/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/models/browser-api.abstract.ts
 * Purpose: Abstract browser API interface for cross-browser compatibility
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

import { ContentScriptMessage } from './content-script-message.model';
import { BackgroundToContentMessage } from './background-to-content-message.model';
import { MessageSender } from './message-sender.model';
import { StorageData } from './storage-data.model';

/**
 * Abstract class defining the blueprint for cross-browser API compatibility
 * Concrete implementations will provide browser-specific functionality
 */
export abstract class BrowserAPI {
  /**
   * Storage API - Local storage operations
   */
  abstract storageLocalGet<K extends keyof StorageData>(
    keys?: K | K[] | null,
  ): Promise<Partial<StorageData>>;

  abstract storageLocalSet(items: Partial<StorageData>): Promise<void>;

  /**
   * Runtime API - Messaging
   */
  abstract runtimeSendMessage(
    message: ContentScriptMessage | BackgroundToContentMessage,
  ): Promise<void>;

  abstract runtimeOnMessageAddListener(
    callback: (
      message: ContentScriptMessage | BackgroundToContentMessage,
      sender: MessageSender,
      sendResponse: (response?: unknown) => void,
    ) => void | boolean | Promise<void>,
  ): void;

  /**
   * Page notifications - Show toast notifications on the page in a specific tab
   */
  abstract showPageError(tabId: number, message: string): Promise<void>;
  abstract showPageSuccess(tabId: number, message: string): Promise<void>;
  abstract showPageInfo(tabId: number, message: string): Promise<void>;
  abstract showPageWarning(tabId: number, message: string): Promise<void>;
}
