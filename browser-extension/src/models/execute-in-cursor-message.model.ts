/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/models/execute-in-cursor-message.model.ts
 * Purpose: Execute in Cursor message data model
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

/**
 * Message to execute code in Cursor
 */
export interface ExecuteInCursorMessage {
  type: 'executeInCursor';
  comment: string;
  codeSnippet: string;
  filePath: string;
  repoUrl: string;
  autoSubmit: boolean;
}
