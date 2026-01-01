# GitHub Copilot OpenAI-Compatible Provider for AI SDK

This package provides an OpenAI-compatible interface for GitHub Copilot API, designed to work seamlessly with Vercel AI SDK v6.

## Features

- Full TypeScript support
- Seamless integration with Vercel AI SDK v6
- Easy to use API matching other AI SDK providers
- **Automatic endpoint switching**: Uses `/responses` endpoint for Codex models, `/chat/completions` for others
- **Smart request formatting**: Automatically converts `messages` array to OpenAI Responses API `input` format for Codex models

## Installation

### AI SDK v6 (Current)
```bash
npm install @opeoginni/github-copilot-openai-compatible
```

### AI SDK v5
If you need AI SDK v5 support, use the `ai-v5` tag:
```bash
npm install @opeoginni/github-copilot-openai-compatible@ai-v5
```

## Authentication

### Getting Your Token

To get your GitHub Copilot API token, check out [`opencode-copilot-auth`](https://github.com/sst/opencode-copilot-auth/tree/main).

### Required Headers

GitHub Copilot requires specific headers for authentication. While the provider handles your API key, you may need to configure additional headers:

```typescript
const githubCopilot = createGithubCopilotOpenAICompatible({
  apiKey: process.env.COPILOT_TOKEN,
  headers: {
    "Copilot-Integration-Id": "vscode-chat",
    "User-Agent": "GitHubCopilotChat/0.26.7",
    "Editor-Version": "vscode/1.104.1",
    "Editor-Plugin-Version": "copilot-chat/0.26.7"
  },
});
```

These headers identify your application to GitHub Copilot. You may need to update version numbers based on your integration.

## Usage

### Quick Start

```typescript
import { createGithubCopilotOpenAICompatible } from '@opeoginni/github-copilot-openai-compatible';
import { generateText } from 'ai';

const githubCopilot = createGithubCopilotOpenAICompatible({
  apiKey: process.env.COPILOT_TOKEN,
  headers: {
    "Copilot-Integration-Id": "vscode-chat",
    "User-Agent": "GitHubCopilotChat/0.26.7",
    "Editor-Version": "vscode/1.104.1",
    "Editor-Plugin-Version": "copilot-chat/0.26.7"
  },
});

// Use Codex model (recommended)
const { text } = await generateText({
  model: githubCopilot('gpt-5.1-codex'),
  prompt: 'Write a Python function to sort a list',
});

console.log(text);
```

## Supported Models

### Codex Models (Uses `/responses` endpoint)

This package fully supports OpenAI's Codex models, which use the advanced OpenAI Responses API:

- `gpt-5-codex` - GPT-5 Codex
- `gpt-5.1-codex` - GPT-5.1 Codex  
- `gpt-5.1-codex-mini` - GPT-5.1 Codex Mini
- `gpt-5.1-codex-max` - GPT-5.1 Codex Max

### Other Models

For non-Codex models (standard chat completions), check your GitHub Copilot settings to see which models are available to you. You can use any model ID that Copilot supports - they'll automatically route to the `/chat/completions` endpoint.

> **Note:** GitHub Copilot may provide access to various models (Claude, GPT, Gemini, etc.) based on your subscription. Check your Copilot settings for the full list of available models.

## How It Works

### Endpoint Routing

The provider automatically routes requests to the correct endpoint based on the model ID:

- **Codex Models** (`gpt-5-codex` or any model containing 'codex'): 
  - Uses `/responses` endpoint
  - Converts `messages` array to OpenAI Responses API `input` format
  - Transforms message content parts (e.g., `text` → `input_text`, `image_url` → `input_image`)
  - System messages become `developer` role messages

- **All Other Models**:
  - Uses standard `/chat/completions` endpoint
  - Uses standard OpenAI-compatible `messages` array format

This means you don't need to worry about the underlying API differences - the provider handles it automatically!

## API Reference

### `createGithubCopilotOpenAICompatible(options)`

Creates a new GitHub Copilot provider instance.

**Options:**
- `apiKey?`: Your GitHub Copilot API token
- `baseURL?`: Base URL for API calls (default: `https://api.githubcopilot.com`)
- `name?`: Provider name (default: `githubcopilot`)
- `headers?`: Custom headers to include in requests
- `fetch?`: Custom fetch implementation

**Returns:** A provider instance.

### `githubCopilot`

Pre-configured default provider instance. For production use, create your own instance with proper headers:

```typescript
import { githubCopilot } from '@opeoginni/github-copilot-openai-compatible';
import { generateText } from 'ai';

// Create your own configured instance
const copilot = createGithubCopilotOpenAICompatible({
  apiKey: process.env.COPILOT_TOKEN,
  headers: {
    "Copilot-Integration-Id": "vscode-chat",
    "User-Agent": "GitHubCopilotChat/0.26.7",
    "Editor-Version": "vscode/1.104.1",
    "Editor-Plugin-Version": "copilot-chat/0.26.7"
  },
});

const { text } = await generateText({
  model: copilot('gpt-5.1-codex'),
  prompt: 'Hello, world!',
});
```

## License

MIT
