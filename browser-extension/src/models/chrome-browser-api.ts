/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/models/chrome-browser-api.ts
 * Purpose: Chrome/Chromium browser API implementation
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

import { BrowserAPI } from './browser-api.abstract';
import { ContentScriptMessage } from './content-script-message.model';
import { BackgroundToContentMessage } from './background-to-content-message.model';
import { MessageSender } from './message-sender.model';
import { StorageData } from './storage-data.model';

/**
 * Chrome implementation of the BrowserAPI
 */
export class ChromeBrowserAPI extends BrowserAPI {
  storageLocalGet<K extends keyof StorageData>(
    keys?: K | K[] | null,
  ): Promise<Partial<StorageData>> {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys as string | string[] | null, (result) => {
        resolve(result as Partial<StorageData>);
      });
    });
  }

  storageLocalSet(items: Partial<StorageData>): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set(items, () => {
        resolve();
      });
    });
  }

  runtimeSendMessage(message: ContentScriptMessage | BackgroundToContentMessage): Promise<void> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, () => {
        resolve();
      });
    });
  }

  runtimeOnMessageAddListener(
    callback: (
      message: ContentScriptMessage | BackgroundToContentMessage,
      sender: MessageSender,
      sendResponse: (response?: unknown) => void,
    ) => void | boolean | Promise<void>,
  ): void {
    chrome.runtime.onMessage.addListener(
      (
        message: unknown,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: unknown) => void,
      ) => {
        const result = callback(
          message as ContentScriptMessage | BackgroundToContentMessage,
          sender as MessageSender,
          sendResponse,
        );
        return result as boolean | undefined;
      },
    );
  }

  showPageError(tabId: number, message: string): Promise<void> {
    return this.sendMessageToTab(tabId, { type: 'showError', message });
  }

  showPageSuccess(tabId: number, message: string): Promise<void> {
    return this.sendMessageToTab(tabId, { type: 'showSuccess', message });
  }

  showPageInfo(tabId: number, message: string): Promise<void> {
    return this.sendMessageToTab(tabId, { type: 'showInfo', message });
  }

  showPageWarning(tabId: number, message: string): Promise<void> {
    return this.sendMessageToTab(tabId, { type: 'showWarning', message });
  }

  private sendMessageToTab(tabId: number, message: BackgroundToContentMessage): Promise<void> {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, message, () => {
        resolve();
      });
    });
  }
}
