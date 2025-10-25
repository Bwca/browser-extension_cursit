import { AzureDevOpsAddResolveButtonBuilder } from './azure-devops-add-resolve-button-builder';
import { GitHubAddResolveButtonBuilder } from './github-add-resolve-button-builder';

export function getBuilder() {
  if (window.location.hostname === 'dev.azure.com') {
    return new AzureDevOpsAddResolveButtonBuilder();
  } else if (window.location.hostname === 'github.com') {
    return new GitHubAddResolveButtonBuilder();
  }
  return null;
}
