import { LanguageModelV2, LanguageModelV3 } from '@ai-sdk/provider';
import { OpenAICompatibleChatLanguageModel } from '@ai-sdk/openai-compatible';
import {
  FetchFunction,
  withoutTrailingSlash,
  withUserAgentSuffix,
} from '@ai-sdk/provider-utils';
import { createOpenAI } from '@ai-sdk/openai';
import { GitHubCopilotModelId } from './github-copilot-chat-settings';
import { OpenAIResponsesLanguageModel } from './responses/openai-responses-language-model';

// Import the version or define it
const VERSION = '0.1.0';

export interface GitHubCopilotProviderSettings {
  /**
   * API key for authenticating requests.
   */
  apiKey?: string;

  /**
   * Base URL for the GitHub Copilot API calls.
   */
  baseURL?: string;

  /**
   * Name of the provider.
   */
  name?: string;

  /**
   * Custom headers to include in the requests.
   */
  headers?: Record<string, string>;

  /**
   * Custom fetch implementation.
   */
  fetch?: FetchFunction;
}

export interface GitHubCopilotProvider {
  /**
   * Creates a GitHub Copilot model for text generation.
   */
  (modelId: GitHubCopilotModelId): LanguageModelV2;

  /**
   * Creates a GitHub Copilot model for text generation.
   */
  chatModel(modelId: GitHubCopilotModelId): LanguageModelV2;

  /**
   * Creates a GitHub Copilot model for text generation.
   */
  languageModel(modelId: GitHubCopilotModelId): LanguageModelV2;
}

/**
 * Create a GitHub Copilot provider instance.
 */
export function createGitHubCopilotOpenAICompatible(
  options: GitHubCopilotProviderSettings = {}
): GitHubCopilotProvider {
  const baseURL = withoutTrailingSlash(
    options.baseURL ?? 'https://api.githubcopilot.com'
  );

  if (!baseURL) {
    throw new Error('baseURL is required');
  }

  // Merge headers: defaults first, then user overrides
  const headers = {
    // Default GitHub Copilot headers (can be overridden by user)
    "Copilot-Integration-Id": "vscode-chat",
    "User-Agent": "GitHubCopilotChat/0.26.7",
    "Editor-Version": "vscode/1.104.1",
    "Editor-Plugin-Version": "copilot-chat/0.26.7",
    ...(options.apiKey && { Authorization: `Bearer ${options.apiKey}` }),
    ...options.headers,
  };

  const getHeaders = () =>
    withUserAgentSuffix(headers, `opeoginni/github-copilot-openai-compatible/${VERSION}`);  

  const createChatModel = (modelId: GitHubCopilotModelId) => {
    // If model is gpt-5-codex, use the responses API
    if (modelId.includes('gpt-5-codex')) {
      return new OpenAIResponsesLanguageModel(modelId, {
        provider: `${options.name ?? 'githubcopilot'}.responses`,
        headers: getHeaders,
        url: ({ path }) => `${baseURL}${path}`,
        fetch: options.fetch,
      });
    }

    return new OpenAICompatibleChatLanguageModel(modelId, {
      provider: `${options.name ?? 'githubcopilot'}.chat`,
      headers: getHeaders,
      url: ({ path }) => `${baseURL}${path}`,
      fetch: options.fetch,
    });
  };

  const createLanguageModel = (modelId: GitHubCopilotModelId) =>
    createChatModel(modelId);


  const provider = function (modelId: GitHubCopilotModelId) {
    return createChatModel(modelId);
  };

  provider.languageModel = createLanguageModel;
  provider.chatModel = createChatModel;

  return provider as GitHubCopilotProvider;
}

// Default GitHub Copilot provider instance
export const githubCopilot = createGitHubCopilotOpenAICompatible();
