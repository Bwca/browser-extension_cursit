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
