import { BrowserAPI } from './browser-api.abstract';
import { ContentScriptMessage } from './content-script-message.model';
import { BackgroundToContentMessage } from './background-to-content-message.model';
import { MessageSender } from './message-sender.model';
import { StorageData } from './storage-data.model';

/**
 * Firefox implementation of the BrowserAPI
 * Firefox uses the browser.* API which is Promise-based by default
 */
export class FirefoxBrowserAPI extends BrowserAPI {
  storageLocalGet<K extends keyof StorageData>(
    keys?: K | K[] | null
  ): Promise<Partial<StorageData>> {
    return browser.storage.local.get(keys as string | string[] | null) as Promise<
      Partial<StorageData>
    >;
  }

  storageLocalSet(items: Partial<StorageData>): Promise<void> {
    return browser.storage.local.set(items);
  }

  runtimeSendMessage(message: ContentScriptMessage | BackgroundToContentMessage): Promise<void> {
    return browser.runtime.sendMessage(message).then(() => undefined);
  }

  runtimeOnMessageAddListener(
    callback: (
      message: ContentScriptMessage | BackgroundToContentMessage,
      sender: MessageSender,
      sendResponse: (response?: unknown) => void
    ) => void | boolean | Promise<void>
  ): void {
    browser.runtime.onMessage.addListener(
      (
        message: unknown,
        sender: browser.runtime.MessageSender,
        sendResponse: (response?: unknown) => void
      ) => {
        const result = callback(
          message as ContentScriptMessage | BackgroundToContentMessage,
          sender as MessageSender,
          sendResponse
        );
        return result as boolean | undefined;
      }
    );
  }

  showPageError(tabId: number, message: string): Promise<void> {
    return this.sendMessageToTab(tabId, { type: 'showError', message });
  }

  showPageSuccess(tabId: number, message: string): Promise<void> {
    return this.sendMessageToTab(tabId, { type: 'showSuccess', message });
  }

  showPageInfo(tabId: number, message: string): Promise<void> {
    return this.sendMessageToTab(tabId, { type: 'showInfo', message });
  }

  showPageWarning(tabId: number, message: string): Promise<void> {
    return this.sendMessageToTab(tabId, { type: 'showWarning', message });
  }

  private sendMessageToTab(tabId: number, message: BackgroundToContentMessage): Promise<void> {
    return browser.tabs.sendMessage(tabId, message).then(() => undefined);
  }
}
