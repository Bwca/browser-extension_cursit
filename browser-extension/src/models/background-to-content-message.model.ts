/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/models/background-to-content-message.model.ts
 * Purpose: Background to content script message union type
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

import { ShowErrorMessage } from './show-error-message.model';
import { ShowSuccessMessage } from './show-success-message.model';
import { ShowInfoMessage } from './show-info-message.model';
import { ShowWarningMessage } from './show-warning-message.model';

/**
 * Union type for all messages sent from background script to content script
 */
export type BackgroundToContentMessage =
  | ShowErrorMessage
  | ShowSuccessMessage
  | ShowInfoMessage
  | ShowWarningMessage;
