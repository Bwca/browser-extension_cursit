/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/models/content-script-message.model.ts
 * Purpose: Content script message union type
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

import { ResolveCommentMessage } from './resolve-comment-message.model';
import { ExecuteInCursorMessage } from './execute-in-cursor-message.model';

/**
 * Union type for all messages sent from content script to background script
 */
export type ContentScriptMessage = ResolveCommentMessage | ExecuteInCursorMessage;
