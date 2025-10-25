/**
 * Message to resolve a comment
 */
export interface ResolveCommentMessage {
  type: 'resolveComment';
  comment: string;
  codeSnippet: string;
  filePath: string;
  repoUrl: string;
  autoSubmit: boolean;
}
