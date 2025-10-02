# GitHub Copilot OpenAI-Compatible Provider for AI SDK

This package provides an OpenAI-compatible interface for the GitHub Copilot API, designed to work seamlessly with the Vercel AI SDK.

## Features

- Full TypeScript support
- Seamless integration with Vercel AI SDK
- Easy to use API matching other AI SDK providers
- Flexible authentication via headers (Bearer token)
- **Automatic endpoint switching**: Uses `/responses` endpoint for Codex models, `/chat/completions` for others
- **Smart request formatting**: Automatically converts `messages` to `item` format for Codex models

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

### Using Codex Models

The provider automatically handles the different API format for Codex models:

```typescript
import { createGithubCopilotOpenAICompatible } from '@opeoginni/github-copilot-openai-compatible';

const githubCopilot = createGithubCopilotOpenAICompatible({
  baseURL: 'https://api.githubcopilot.com',
  name: 'githubcopilot',
  headers: {
    Authorization: `Bearer ${process.env.COPILOT_TOKEN}`,
  },
});

// This will automatically use the /responses endpoint with 'item' format
const codexModel = githubCopilot.chatModel('gpt-5-codex');

const { text } = await generateText({
  model: codexModel,
  prompt: 'Write a Python function to sort a list',
});
```


### Minimal Configuration

```typescript
import { createGithubCopilotOpenAICompatible } from '@opeoginni/github-copilot-openai-compatible';

// Minimal setup - just provide the auth token
const githubCopilot = createGithubCopilotOpenAICompatible({
  baseURL: 'https://api.githubcopilot.com',
  name: 'githubcopilot',
  headers: {
    Authorization: `Bearer ${process.env.COPILOT_TOKEN}`,
  },
});

const model = githubCopilot.chatModel('gpt-4o');
```


## Supported Models

### Claude Models
- `claude-opus-4` - Claude Opus 4
- `claude-opus-41` - Claude Opus 4.1
- `claude-3.5-sonnet` - Claude 3.5 Sonnet
- `claude-3.7-sonnet` - Claude 3.7 Sonnet
- `claude-3.7-sonnet-thought` - Claude 3.7 Sonnet with Reasoning
- `claude-sonnet-4` - Claude Sonnet 4
- `claude-sonnet-4.5` - Claude Sonnet 4.5

### GPT Models
- `gpt-4.1` - GPT-4.1
- `gpt-4o` - GPT-4 Optimized
- `gpt-5` - GPT-5
- `gpt-5-codex` - GPT-5 Codex (uses `/responses` endpoint)
- `gpt-5-mini` - GPT-5 Mini

### Gemini Models
- `gemini-2.0-flash-001` - Gemini 2.0 Flash
- `gemini-2.5-pro` - Gemini 2.5 Pro

### Other Models
- `grok-code-fast-1` - Grok Code Fast
- `o3` - OpenAI O3
- `o3-mini` - OpenAI O3 Mini
- `o4-mini` - OpenAI O4 Mini

Plus any custom model ID (type-safe with TypeScript)

## How It Works

### Endpoint Routing

The provider automatically routes requests to the correct endpoint based on the model ID:

- **Codex Models** (`gpt-5-codex` or any model containing 'codex'): 
  - Uses `/responses` endpoint
  - Converts `messages` array to `item` string format
  - Extracts the last user message content

- **All Other Models**:
  - Uses standard `/chat/completions` endpoint
  - Uses standard OpenAI-compatible `messages` array format

This means you don't need to worry about the underlying API differences - the provider handles it automatically!

## API Reference

### `createGithubCopilotOpenAICompatible(options)`

Creates a new GitHub Copilot provider instance.

**Options:**
- `baseURL` (required): Base URL for API calls
- `name` (required): Provider name
- `headers?`: Custom headers to include in requests
- `queryParams?`: Optional URL query parameters
- `fetch?`: Custom fetch implementation
- `includeUsage?`: Include usage information in responses
- `supportsStructuredOutputs?`: Enable structured outputs support

**Returns:** A provider instance with `chatModel()` and `languageModel()` methods, also callable as a function.

### `githubCopilot`

Pre-configured default provider instance with common GitHub Copilot headers. You'll need to provide authentication separately.

## Getting Your GitHub Copilot API Key

To use this provider, you'll need a GitHub Copilot API token. This is typically obtained through GitHub Copilot's authentication flow in VS Code or other supported editors.

## License

MIT
