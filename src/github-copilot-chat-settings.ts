export type GitHubCopilotModelId =
  | 'claude-opus-4'
  | 'claude-opus-41'
  | 'claude-3.5-sonnet'
  | 'claude-3.7-sonnet'
  | 'claude-3.7-sonnet-thought'
  | 'claude-sonnet-4'
  | 'claude-sonnet-4.5'
  | 'gemini-2.0-flash-001'
  | 'gemini-2.5-pro'
  | 'gpt-4.1'
  | 'gpt-4o'
  | 'gpt-5'
  | 'gpt-5-codex'
  | 'gpt-5-mini'
  | 'grok-code-fast-1'
  | 'o3'
  | 'o3-mini'
  | 'o4-mini'
  | (string & {});

export interface GitHubCopilotChatSettings {
  /**
   * Optional settings specific to GitHub Copilot models
   */
}
