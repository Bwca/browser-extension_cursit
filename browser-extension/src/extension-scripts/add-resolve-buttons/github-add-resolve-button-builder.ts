import { AddResolveButtonBuilder } from './add-resolve-button-builder';

export class GitHubAddResolveButtonBuilder extends AddResolveButtonBuilder {
  constructor() {
    super();
    this.setCommentThreadSelector('.timeline-comment-group')
      .setCommentContentSelector('.comment-body')
      .setActionsSelector('.timeline-comment-actions')
      .setCodeSnippetSelector('.blob-code-inner')
      .setFilePathSelector('.file-header a[title]');
  }

  override getFilePath(thread: HTMLElement) {
    // Strategy 1: "Files changed" tab. Look for the file header.
    const fileElement = thread.closest('.file');
    if (fileElement) {
      const filePathElement = fileElement.querySelector(this.filePathSelector);
      if (filePathElement) {
        return (filePathElement as HTMLAnchorElement).title;
      }
    }

    // Strategies for "Conversation" tab
    const reviewThreadComponent = thread.closest('.review-thread-component');
    if (reviewThreadComponent) {
      // Strategy 2: Look for the file path in the comment summary link.
      const conversationFilePathElement =
        reviewThreadComponent.querySelector('summary a.Link--primary');
      if (
        conversationFilePathElement &&
        (conversationFilePathElement as HTMLAnchorElement)?.href.includes('/files')
      ) {
        return conversationFilePathElement.textContent.trim();
      }

      // Strategy 3: Look for hidden input field in suggestion forms.
      const suggestionForm = reviewThreadComponent.querySelector(
        'form.js-single-suggested-change-form'
      );
      if (suggestionForm) {
        const pathInput = suggestionForm.querySelector('input[name="path"]');
        if (pathInput) {
          return (pathInput as HTMLInputElement).value;
        }
      }
    }

    return '';
  }

  override getCodeSnippets(thread: HTMLElement) {
    const reviewThreadComponent = thread.closest('.review-thread-component');
    const codeSnippetElements = reviewThreadComponent
      ? reviewThreadComponent.querySelectorAll(this.codeSnippetSelector)
      : [];
    const codeSnippets = Array.from(codeSnippetElements).map((el) => el.textContent);
    return codeSnippets.join('\n\n');
  }

  override getRepoUrl() {
    // For GitHub: https://github.com/owner/repo/pull/123 -> https://github.com/owner/repo
    const pathSegments = window.location.pathname.split('/');
    const repoUrl = `${window.location.protocol}//${window.location.hostname}${pathSegments
      .slice(0, 3)
      .join('/')}`;
    console.log('CursIt-Extension: GitHub repo URL:', repoUrl);
    return repoUrl;
  }
}
