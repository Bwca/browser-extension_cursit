/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/src/utils/browser-api-factory.ts
 * Purpose: Browser API factory - detects browser and returns appropriate API implementation
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

import { BrowserAPI } from '../models/browser-api.abstract';
import { ChromeBrowserAPI } from '../models/chrome-browser-api';
import { FirefoxBrowserAPI } from '../models/firefox-browser-api';

/**
 * Detects if the browser is Firefox
 */
function isFirefox(): boolean {
  return typeof browser !== 'undefined' && typeof browser.runtime !== 'undefined';
}

/**
 * Factory function to get the appropriate browser API implementation
 * Detects the browser and returns Chrome or Firefox implementation
 */
export function getBrowserAPI(): BrowserAPI {
  if (isFirefox()) {
    console.log('CursIt-Extension: Using Firefox browser API');
    return new FirefoxBrowserAPI();
  } else {
    console.log('CursIt-Extension: Using Chrome browser API');
    return new ChromeBrowserAPI();
  }
}
