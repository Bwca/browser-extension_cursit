/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/models/show-error-message.model.ts
 * Purpose: Show error message data model
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

/**
 * Message to show an error notification
 */
export interface ShowErrorMessage {
  type: 'showError';
  message: string;
}
