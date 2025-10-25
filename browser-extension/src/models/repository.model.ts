/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/models/repository.model.ts
 * Purpose: Repository configuration data model
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

/**
 * Repository configuration
 */
export interface Repository {
  url: string;
  path: string;
}
