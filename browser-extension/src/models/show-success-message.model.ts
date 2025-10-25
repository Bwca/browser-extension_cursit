/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/models/show-success-message.model.ts
 * Purpose: Show success message data model
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

/**
 * Message to show a success notification
 */
export interface ShowSuccessMessage {
  type: 'showSuccess';
  message: string;
}
