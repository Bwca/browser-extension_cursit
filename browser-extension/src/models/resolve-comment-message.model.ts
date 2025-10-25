/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/models/resolve-comment-message.model.ts
 * Purpose: Resolve comment message data model
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

/**
 * Message to resolve a comment
 */
export interface ResolveCommentMessage {
  type: 'resolveComment';
  comment: string;
  codeSnippet: string;
  filePath: string;
  repoUrl: string;
  autoSubmit: boolean;
}
