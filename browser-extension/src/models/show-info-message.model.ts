/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/models/show-info-message.model.ts
 * Purpose: Show info message data model
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

/**
 * Message to show an info notification
 */
export interface ShowInfoMessage {
  type: 'showInfo';
  message: string;
}
