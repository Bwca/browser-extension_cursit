/**
 * Message to execute code in Cursor
 */
export interface ExecuteInCursorMessage {
  type: 'executeInCursor';
  comment: string;
  codeSnippet: string;
  filePath: string;
  repoUrl: string;
  autoSubmit: boolean;
}
