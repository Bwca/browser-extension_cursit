/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/extension-scripts/add-resolve-buttons/get-builder.ts
 * Purpose: Builder factory - returns appropriate button builder based on platform
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

import { AzureDevOpsAddResolveButtonBuilder } from './azure-devops-add-resolve-button-builder';
import { GitHubAddResolveButtonBuilder } from './github-add-resolve-button-builder';

export function getBuilder() {
  if (window.location.hostname === 'dev.azure.com') {
    return new AzureDevOpsAddResolveButtonBuilder();
  } else if (window.location.hostname === 'github.com') {
    return new GitHubAddResolveButtonBuilder();
  }
  return null;
}
