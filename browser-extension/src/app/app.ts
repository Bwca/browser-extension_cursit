import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getBrowserAPI } from '../utils/browser-api-factory';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App implements OnInit {
  private browserAPI = getBrowserAPI();
  repositories = signal<{ url: string; path: string }[]>([]);
  newRepoUrl = '';
  newRepoPath = '';

  ngOnInit() {
    this.loadRepositories();
  }

  async loadRepositories() {
    const result = await this.browserAPI.storageLocalGet('repositories');
    if (result.repositories) {
      this.repositories.set(result.repositories);
    }
  }

  addRepository() {
    if (this.newRepoUrl && this.newRepoPath) {
      const newRepo = { url: this.newRepoUrl, path: this.newRepoPath };
      this.repositories.update((repos) => [...repos, newRepo]);
      this.saveRepositories();
      this.newRepoUrl = '';
      this.newRepoPath = '';
    }
  }

  removeRepository(url: string) {
    this.repositories.update((repos) => repos.filter((repo) => repo.url !== url));
    this.saveRepositories();
  }

  async saveRepositories() {
    await this.browserAPI.storageLocalSet({ repositories: this.repositories() });
  }
}
