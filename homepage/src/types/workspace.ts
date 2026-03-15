export type ProviderName = "openai" | "anthropic" | "gemini";
export type CredentialStatus = "pending" | "valid" | "invalid" | "error";
export type ManagedKeyStatus = "active" | "disabled";
export type RoutingMode = "auto" | "manual";

export interface ProviderCredentialRecord {
  id: string;
  user_id: string;
  provider: ProviderName;
  label: string;
  secret_mask: string;
  status: CredentialStatus;
  validation_error: string | null;
  last_validated_at: string | null;
  monthly_token_cap: number | null;
  created_at: string;
  updated_at: string;
}

export interface ManagedApiKeyRecord {
  id: string;
  user_id: string;
  key_name: string;
  secret_preview: string | null;
  status: ManagedKeyStatus;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageEventRecord {
  id: string;
  user_id: string;
  credential_id: string | null;
  conversation_id: string | null;
  provider: ProviderName;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number | null;
  created_at: string;
}

export interface ProviderUsageSummary {
  provider: ProviderName;
  total_tokens: number;
  estimated_cost_usd: number;
  credential_count: number;
  valid_credential_count: number;
}

export interface WorkspaceKeyListResponse {
  credentials: ProviderCredentialRecord[];
  managedKey: ManagedApiKeyRecord | null;
  usageSummary: ProviderUsageSummary[];
}

export interface ConversationRecord {
  id: string;
  user_id: string;
  title: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface MessageRecord {
  id: string;
  conversation_id: string;
  role: "system" | "user" | "assistant";
  content: string;
  provider: ProviderName | null;
  model: string | null;
  routing_mode: RoutingMode;
  created_at: string;
}

export interface ConversationMessagesResponse {
  conversation: ConversationRecord;
  messages: MessageRecord[];
}

export interface NormalizedUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number | null;
}

export interface ChatCompletionResponse {
  conversation: ConversationRecord;
  userMessage: MessageRecord;
  assistantMessage: MessageRecord;
  selectedProvider: ProviderName;
  selectedModel: string;
  routingMode: RoutingMode;
  usage: NormalizedUsage;
}
