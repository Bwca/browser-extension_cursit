/**
 * Message sender information (simplified from chrome.runtime.MessageSender)
 */
export interface MessageSender {
  tab?: {
    id: number;
    url?: string;
  };
  url?: string;
  id?: string;
}
