# GitHub Copilot OpenAI-Compatible Provider for AI SDK

This package provides an OpenAI-compatible interface for the GitHub Copilot API, designed to work seamlessly with the Vercel AI SDK.

## Features

- Full TypeScript support
- Seamless integration with Vercel AI SDK
- Easy to use API matching other AI SDK providers
- Flexible authentication via headers (Bearer token)
- Automatic endpoint switching based on model (uses `/responses` endpoint for Copilot codex model)

## Installation

```bash
npm install @opeoginni/github-copilot-openai-compatible
```

## Usage

### Basic Usage

```typescript
import { createGithubCopilotOpenAICompatible } from '@opeoginni/github-copilot-openai-compatible';
import { generateText } from 'ai';

// Create the provider instance
const githubCopilot = createGithubCopilotOpenAICompatible({
  baseURL: 'https://api.githubcopilot.com',
  name: 'githubcopilot',
  headers: {
    Authorization: `Bearer ${process.env.COPILOT_API_KEY}`,
    "Copilot-Integration-Id": "vscode-chat",
    "User-Agent": "GitHubCopilotChat/0.26.7",
    "Editor-Version": "vscode/1.104.1",
    "Editor-Plugin-Version": "copilot-chat/0.26.7"
  },
});

// Use the chat model
const { text } = await generateText({
  model: githubCopilot.chatModel('gpt-4o'),
  prompt: 'Create a function to calculate the Fibonacci sequence',
});

console.log(text);
```

### Using the Default Instance

For convenience, you can use the pre-configured default instance:

```typescript
import { githubCopilot } from '@opeoginni/github-copilot-openai-compatible';
import { generateText } from 'ai';

// Note: You'll need to set the Authorization header yourself
const { text } = await generateText({
  model: githubCopilot('gpt-4o'),
  prompt: 'Create a function to calculate the Fibonacci sequence',
});
```

### Minimal Configuration

```typescript
import { createGithubCopilotOpenAICompatible } from '@opeoginni/github-copilot-openai-compatible';

// Minimal setup - just provide the auth token
const githubCopilot = createGithubCopilotOpenAICompatible({
  headers: {
    Authorization: `Bearer ${process.env.COPILOT_API_KEY}`,
  },
});

const model = githubCopilot.chatModel('gpt-4o');
```

### Advanced Configuration

```typescript
import { createGithubCopilotOpenAICompatible } from '@opeoginni/github-copilot-openai-compatible';

const githubCopilot = createGithubCopilotOpenAICompatible({
  baseURL: 'https://api.githubcopilot.com', // Custom base URL
  name: 'githubcopilot', // Provider name
  headers: {
    Authorization: `Bearer ${process.env.COPILOT_API_KEY}`,
    "Copilot-Integration-Id": "vscode-chat",
    "User-Agent": "GitHubCopilotChat/0.26.7",
    "Editor-Version": "vscode/1.104.1",
    "Editor-Plugin-Version": "copilot-chat/0.26.7",
    // Additional custom headers
  },
  queryParams: {
    // Optional query parameters
  },
  fetch: customFetch, // Custom fetch implementation
});

const model = githubCopilot.chatModel('gpt-4o');
```

## Supported Models

- `o1-mini` - OpenAI O1 Mini
- `claude-3.5-sonnet` - Claude 3.5 Sonnet
- `gpt-5-codex` - GPT-5 Codex
- Any custom model ID (type-safe with TypeScript)

## API Reference

### `createGithubCopilotOpenAICompatible(options?)`

Creates a new GitHub Copilot provider instance.

**Options:**
- `baseURL?`: Base URL for API calls (default: `https://api.githubcopilot.com`)
- `name?`: Provider name (default: `githubcopilot`)
- `headers?`: Custom headers to include in requests (required for authentication)
- `queryParams?`: Optional URL query parameters
- `fetch?`: Custom fetch implementation

**Returns:** A provider instance with `chatModel()` method and callable as a function.

### `githubCopilot`

Pre-configured default provider instance with common GitHub Copilot headers. You'll need to provide authentication separately.

## Getting Your GitHub Copilot API Key

To use this provider, you'll need a GitHub Copilot API token. This is typically obtained through GitHub Copilot's authentication flow in VS Code or other supported editors.

## License

MIT
