/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/models/storage-data.model.ts
 * Purpose: Browser storage data structure model
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

import { Repository } from './repository.model';

/**
 * Storage data structure
 */
export interface StorageData {
  repositories?: Repository[];
}
