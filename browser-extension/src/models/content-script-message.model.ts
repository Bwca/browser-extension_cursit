import { ResolveCommentMessage } from './resolve-comment-message.model';
import { ExecuteInCursorMessage } from './execute-in-cursor-message.model';

/**
 * Union type for all messages sent from content script to background script
 */
export type ContentScriptMessage = ResolveCommentMessage | ExecuteInCursorMessage;
