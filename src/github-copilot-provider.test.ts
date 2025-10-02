import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createGitHubCopilotOpenAICompatible } from './github-copilot-provider';

// Mock fetch
global.fetch = vi.fn();

describe('github-copilot provider', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should create a chat model with the correct configuration', async () => {
    const githubCopilot = createGitHubCopilotOpenAICompatible({
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

  it('should create a codex model with the correct configuration', async () => {
    const githubCopilot = createGitHubCopilotOpenAICompatible({
      baseURL: 'https://api.githubcopilot.com',
      name: 'githubcopilot',
      headers: {
        Authorization: `Bearer test-token`,
      },
    });

    const model = githubCopilot.chatModel('gpt-5-codex');
    expect(model).toBeDefined();
    expect(model.provider).toBe('githubcopilot.responses');
    expect(model.modelId).toBe('gpt-5-codex');
  });

  it('should work with minimal configuration', async () => {
    const githubCopilot = createGitHubCopilotOpenAICompatible({
      baseURL: 'https://api.githubcopilot.com',
      name: 'githubcopilot',
      headers: {
        Authorization: 'Bearer custom-token',
      },
    });

    const model = githubCopilot.chatModel('claude-3.5-sonnet');
    expect(model).toBeDefined();
    expect(model.provider).toBe('githubcopilot.chat');
    expect(model.modelId).toBe('claude-3.5-sonnet');
  });

  it('should support custom provider name', async () => {
    const githubCopilot = createGitHubCopilotOpenAICompatible({
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


  it('should support languageModel method', async () => {
    const githubCopilot = createGitHubCopilotOpenAICompatible({
      baseURL: 'https://api.githubcopilot.com',
      name: 'githubcopilot',
      headers: {
        Authorization: 'Bearer test-token',
      },
    });

    const model = githubCopilot.chatModel('gemini-2.5-pro');
    expect(model).toBeDefined();
    expect(model.provider).toBe('githubcopilot.chat');
    expect(model.modelId).toBe('gemini-2.5-pro');
  });

  it('should support calling provider directly', async () => {
    const githubCopilot = createGitHubCopilotOpenAICompatible({
      baseURL: 'https://api.githubcopilot.com',
      name: 'githubcopilot',
      headers: {
        Authorization: 'Bearer test-token',
      },
    });

    const model = githubCopilot('o3-mini');
    expect(model).toBeDefined();
    expect(model.provider).toBe('githubcopilot.chat');
    expect(model.modelId).toBe('o3-mini');
  });

  it('should use /chat/completions endpoint with messages for regular models', async () => {
    // Mock the fetch to capture the request
    const responseBody = {
      id: 'test-id',
      model: 'gpt-4o',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'Hello! How can I help you?',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 8,
        total_tokens: 18,
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/json',
      }),
      text: async () => JSON.stringify(responseBody),
      json: async () => responseBody,
    });

    const githubCopilot = createGitHubCopilotOpenAICompatible({
      baseURL: 'https://api.githubcopilot.com',
      name: 'githubcopilot',
      headers: {
        Authorization: 'Bearer test-token',
      },
      fetch: mockFetch as any,
    });

    const model = githubCopilot.chatModel('gpt-4o');
    
    await model.doGenerate({
      prompt: [
        {
          role: "user",
          content: [{
            type: "text",
            text: "Hello, how are you?",
          }],
        }
      ]
    });

    // Verify the fetch was called
    expect(mockFetch).toHaveBeenCalled();
    
    // Verify the URL contains /chat/completions for regular model
    const callUrl = mockFetch.mock.calls[0][0];
    expect(callUrl).toContain('/chat/completions');
    expect(callUrl).not.toContain('/responses');
    
    // Verify the request body uses 'messages' for regular models
    const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(requestBody.messages).toBeDefined();
    expect(Array.isArray(requestBody.messages)).toBe(true);
    expect(requestBody.messages[0].role).toBe('user');
    expect(requestBody.messages[0].content).toBe('Hello, how are you?');
    expect(requestBody.input).toBeUndefined();
  });

  it('should use /responses endpoint with input for codex models', async () => {
    // Mock the fetch to capture the request - use complete Responses API format
    const responseBody = {
      id: 'resp_test-id',
      object: 'response',
      created_at: Math.floor(Date.now() / 1000),
      status: 'completed',
      error: null,
      incomplete_details: null,
      instructions: null,
      max_output_tokens: null,
      model: 'gpt-5-codex',
      output: [
        {
          type: 'message',
          id: 'msg-test-id',
          status: 'completed',
          role: 'assistant',
          content: [
            {
              type: 'output_text',
              text: 'def sort_list(lst):\n    return sorted(lst)',
              annotations: [],
            },
          ],
        },
      ],
      parallel_tool_calls: true,
      previous_response_id: null,
      reasoning: {
        effort: null,
        summary: null,
      },
      store: true,
      temperature: 1.0,
      text: {
        format: {
          type: 'text',
        },
      },
      tool_choice: 'auto',
      tools: [],
      top_p: 1.0,
      truncation: 'disabled',
      usage: {
        input_tokens: 10,
        input_tokens_details: {
          cached_tokens: 0,
        },
        output_tokens: 20,
        output_tokens_details: {
          reasoning_tokens: 0,
        },
        total_tokens: 30,
      },
      user: null,
      metadata: {},
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/json',
      }),
      text: async () => JSON.stringify(responseBody),
      json: async () => responseBody,
    });

    const githubCopilot = createGitHubCopilotOpenAICompatible({
      baseURL: 'https://api.githubcopilot.com',
      name: 'githubcopilot',
      headers: {
        Authorization: 'Bearer test-token',
      },
      fetch: mockFetch as any,
    });

    const model = githubCopilot.chatModel('gpt-5-codex');
    
    await model.doGenerate({
      prompt: [
        {
          role: "user",
          content: [{
            type: "text",
            text: "Write a Python function to sort a list",
          }],
        }
      ]
    });

    // Verify the fetch was called
    expect(mockFetch).toHaveBeenCalled();
    
    // Verify the URL contains /responses for codex model
    const callUrl = mockFetch.mock.calls[0][0];
    expect(callUrl).toContain('/responses');
    expect(callUrl).not.toContain('/chat/completions');
    
    // Verify the request body was transformed to use 'input' instead of 'messages'
    const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(requestBody.input).toBeDefined();
    expect(Array.isArray(requestBody.input)).toBe(true);
    expect(requestBody.input[0].role).toBe('user');
    expect(requestBody.input[0].content).toBeDefined();
    expect(requestBody.input[0].content[0].type).toBe('input_text');
    expect(requestBody.input[0].content[0].text).toBe('Write a Python function to sort a list');
    expect(requestBody.messages).toBeUndefined();
  });
});
