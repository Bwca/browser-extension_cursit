/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/models/show-warning-message.model.ts
 * Purpose: Show warning message data model
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

/**
 * Message to show a warning notification
 */
export interface ShowWarningMessage {
  type: 'showWarning';
  message: string;
}
