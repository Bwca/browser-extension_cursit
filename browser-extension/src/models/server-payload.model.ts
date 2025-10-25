/**
 * Data sent to server
 */
export interface ServerPayload {
  comment: string;
  codeSnippet: string;
  filePath: string;
  workspacePath: string;
  autoSubmit: boolean;
}
