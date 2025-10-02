import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createGithubCopilotOpenAICompatible } from './github-copilot-provider';

// Mock fetch
global.fetch = vi.fn();

describe('github-copilot provider', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should create a chat model with the correct configuration', async () => {
    const githubCopilot = createGithubCopilotOpenAICompatible({
      baseURL: 'https://api.githubcopilot.com',
      name: 'githubcopilot',
      headers: {
        Authorization: `Bearer test-token`,
        "Copilot-Integration-Id": "vscode-chat",
        "User-Agent": "GitHubCopilotChat/0.26.7",
        "Editor-Version": "vscode/1.104.1",
        "Editor-Plugin-Version": "copilot-chat/0.26.7"
      },
    });

    const model = githubCopilot.chatModel('gpt-4o');
    expect(model).toBeDefined();
    expect(model.provider).toBe('githubcopilot.chat');
    expect(model.modelId).toBe('gpt-4o');
  });

  it('should work with minimal configuration', async () => {
    const githubCopilot = createGithubCopilotOpenAICompatible({
      baseURL: 'https://api.githubcopilot.com',
      name: 'githubcopilot',
      headers: {
        Authorization: 'Bearer custom-token',
      },
    });

    const model = githubCopilot.chatModel('gpt-4o-mini');
    expect(model).toBeDefined();
    expect(model.provider).toBe('githubcopilot.chat');
    expect(model.modelId).toBe('gpt-4o-mini');
  });

  it('should support custom provider name', async () => {
    const githubCopilot = createGithubCopilotOpenAICompatible({
      baseURL: 'https://api.githubcopilot.com',
      name: 'custom-copilot',
      headers: {
        Authorization: 'Bearer custom-token',
      },
    });

    const model = githubCopilot.chatModel('gpt-4o');
    expect(model).toBeDefined();
    expect(model.provider).toBe('custom-copilot.chat');
  });

});
