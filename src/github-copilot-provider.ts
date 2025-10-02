import { LanguageModelV2, ProviderV2 } from '@ai-sdk/provider';
import {
  FetchFunction,
  withoutTrailingSlash,
  withUserAgentSuffix,
} from '@ai-sdk/provider-utils';
import {
  OpenAICompatibleChatLanguageModel,
} from '@ai-sdk/openai-compatible';
import { GithubCopilotChatModelId, GithubCopilotChatSettings } from './github-copilot-chat-settings';
import { VERSION } from './version';

export interface GithubCopilotProvider<
  CHAT_MODEL_IDS extends string = string,
> extends Omit<ProviderV2, 'textEmbeddingModel' | 'imageModel'> {
  (modelId: CHAT_MODEL_IDS): LanguageModelV2;

  languageModel(modelId: CHAT_MODEL_IDS): LanguageModelV2;

  chatModel(modelId: CHAT_MODEL_IDS): LanguageModelV2;
}

export interface GithubCopilotProviderSettings {
  /**
   * Base URL for the API calls.
   */
  baseURL: string;

  /**
   * Provider name.
   */
  name: string;

  /**
   * API key for authenticating requests. If specified, adds an `Authorization`
   * header to request headers with the value `Bearer <apiKey>`. This will be added
   * before any headers potentially specified in the `headers` option.
   */
  apiKey?: string;

  /**
   * Optional custom headers to include in requests. These will be added to request headers
   * after any headers potentially added by use of the `apiKey` option.
   */
  headers?: Record<string, string>;

  /**
   * Optional custom url query parameters to include in request urls.
   */
  queryParams?: Record<string, string>;

  /**
   * Custom fetch implementation. You can use it as a middleware to intercept requests,
   * or to provide a custom fetch implementation for e.g. testing.
   */
  fetch?: FetchFunction;

  /**
   * Include usage information in streaming responses.
   */
  includeUsage?: boolean;

  /**
   * Whether the provider supports structured outputs in chat models.
   */
  supportsStructuredOutputs?: boolean;
}

/**
 * Custom implementation of OpenAICompatibleChatLanguageModel that overrides the
 * endpoint path based on the model ID.
 */
class GithubCopilotChatLanguageModel extends OpenAICompatibleChatLanguageModel {
  // Override the doGenerate and doStream methods to use the correct endpoint path
  async doGenerate(
    options: Parameters<LanguageModelV2['doGenerate']>[0],
  ): Promise<Awaited<ReturnType<LanguageModelV2['doGenerate']>>> {
    // Call the parent method but with a modified config.url
    const originalUrl = (this as any).config.url;
    
    // Temporarily replace the url function to use the correct path
    (this as any).config.url = (urlOptions: any) => {
      // If the model is gpt-5-codex or contains 'codex', use /responses endpoint
      const path = this.modelId === 'gpt-5-codex' || this.modelId.includes('codex')
        ? '/responses'
        : '/chat/completions';
      
      return originalUrl({ ...urlOptions, path });
    };
    
    // Call the original method
    const result = await super.doGenerate(options);
    
    // Restore the original url function
    (this as any).config.url = originalUrl;
    
    return result;
  }

  async doStream(
    options: Parameters<LanguageModelV2['doStream']>[0],
  ): Promise<Awaited<ReturnType<LanguageModelV2['doStream']>>> {
    // Call the parent method but with a modified config.url
    const originalUrl = (this as any).config.url;
    
    // Temporarily replace the url function to use the correct path
    (this as any).config.url = (urlOptions: any) => {
      // If the model is gpt-5-codex or contains 'codex', use /responses endpoint
      const path = this.modelId === 'gpt-5-codex' || this.modelId.includes('codex')
        ? '/responses'
        : '/chat/completions';
      
      return originalUrl({ ...urlOptions, path });
    };
    
    // Call the original method
    const result = await super.doStream(options);
    
    // Restore the original url function
    (this as any).config.url = originalUrl;
    
    return result;
  }
}

/**
 * Create a GitHub Copilot provider instance.
 */
export function createGithubCopilotOpenAICompatible<
  CHAT_MODEL_IDS extends string,
>(
  options: GithubCopilotProviderSettings,
): GithubCopilotProvider<CHAT_MODEL_IDS> {
  const baseURL = withoutTrailingSlash(options.baseURL);
  const providerName = options.name;

  interface CommonModelConfig {
    provider: string;
    url: ({ path }: { path: string }) => string;
    headers: () => Record<string, string>;
    fetch?: FetchFunction;
  }

  const headers = {
    ...(options.apiKey && { Authorization: `Bearer ${options.apiKey}` }),
    ...options.headers,
  };

  const getHeaders = () =>
    withUserAgentSuffix(headers, `ai-sdk/github-copilot-openai-compatible/${VERSION}`);

  const getCommonModelConfig = (modelType: string): CommonModelConfig => ({
    provider: `${providerName}.${modelType}`,
    url: ({ path }) => {
      const url = new URL(`${baseURL}${path}`);
      if (options.queryParams) {
        url.search = new URLSearchParams(options.queryParams).toString();
      }
      return url.toString();
    },
    headers: getHeaders,
    fetch: options.fetch,
  });

  const createLanguageModel = (modelId: CHAT_MODEL_IDS) =>
    createChatModel(modelId);

  const createChatModel = (modelId: CHAT_MODEL_IDS) =>
    new GithubCopilotChatLanguageModel(modelId, {
      ...getCommonModelConfig('chat'),
      includeUsage: options.includeUsage,
      supportsStructuredOutputs: options.supportsStructuredOutputs,
    });

  const provider = (modelId: CHAT_MODEL_IDS) => createLanguageModel(modelId);

  provider.languageModel = createLanguageModel;
  provider.chatModel = createChatModel;

  return provider as GithubCopilotProvider<CHAT_MODEL_IDS>;
}

// Export default instance with common GitHub Copilot headers
export const githubCopilot = createGithubCopilotOpenAICompatible({
  baseURL: 'https://api.githubcopilot.com',
  name: 'githubcopilot',
  headers: {
    "Copilot-Integration-Id": "vscode-chat",
    "User-Agent": "GitHubCopilotChat/0.26.7",
    "Editor-Version": "vscode/1.104.1",
    "Editor-Plugin-Version": "copilot-chat/0.26.7",
  },
});
