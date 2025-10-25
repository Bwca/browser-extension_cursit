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
