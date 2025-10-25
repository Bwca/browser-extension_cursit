/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/models/server-payload.model.ts
 * Purpose: Server payload data model
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

/**
 * Data sent to server
 */
export interface ServerPayload {
  comment: string;
  codeSnippet: string;
  filePath: string;
  workspacePath: string;
  autoSubmit: boolean;
}
