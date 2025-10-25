/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/models/message-sender.model.ts
 * Purpose: Message sender information model
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

/**
 * Message sender information (simplified from chrome.runtime.MessageSender)
 */
export interface MessageSender {
  tab?: {
    id: number;
    url?: string;
  };
  url?: string;
  id?: string;
}
