import type { Session } from "@supabase/supabase-js";
import { getAuthErrorMessage } from "./supabase";
import type {
  ChatCompletionResponse,
  ConversationMessagesResponse,
  ConversationRecord,
  WorkspaceKeyListResponse,
} from "../types/workspace";

function getWorkspaceApiBaseUrl() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("Supabase is not configured.");
  }

  return `${supabaseUrl.replace(/\/$/, "")}/functions/v1/workspace-api`;
}

async function parseWorkspaceResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload?.error === "string"
        ? payload.error
        : typeof payload?.message === "string"
          ? payload.message
          : `Workspace request failed with ${response.status}.`;
    throw new Error(message);
  }

  return payload as T;
}

async function workspaceRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    session?: Session | null;
  } = {}
) {
  const { method = "GET", body, session } = options;
  const headers = new Headers({ "Content-Type": "application/json" });

  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const response = await fetch(`${getWorkspaceApiBaseUrl()}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseWorkspaceResponse<T>(response);
}

export async function createWorkspaceHandoff(session: Session) {
  const payload = await workspaceRequest<{ token: string }>("/sso-handoff/create", {
    method: "POST",
    session,
    body: {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    },
  });

  return payload.token;
}

export async function consumeWorkspaceHandoff(token: string) {
  return workspaceRequest<{ accessToken: string; refreshToken: string; expiresAt: string }>(
    "/sso-handoff/consume",
    {
      method: "POST",
      body: { token },
    }
  );
}

export async function listWorkspaceKeys(session: Session) {
  return workspaceRequest<WorkspaceKeyListResponse>("/credentials/list", { session });
}

export async function ensureManagedKey(session: Session) {
  return workspaceRequest<WorkspaceKeyListResponse>("/managed-key/bootstrap", {
    method: "POST",
    session,
  });
}

export async function createProviderCredential(
  session: Session,
  payload: {
    provider: "openai" | "anthropic" | "gemini";
    label: string;
    secret: string;
    monthlyTokenCap?: number | null;
  }
) {
  return workspaceRequest<WorkspaceKeyListResponse>("/credentials/create", {
    method: "POST",
    session,
    body: payload,
  });
}

export async function validateProviderCredential(session: Session, credentialId: string) {
  return workspaceRequest<WorkspaceKeyListResponse>("/credentials/validate", {
    method: "POST",
    session,
    body: { credentialId },
  });
}

export async function listConversations(session: Session) {
  return workspaceRequest<{ conversations: ConversationRecord[] }>("/conversations", { session });
}

export async function createConversation(session: Session, title?: string) {
  return workspaceRequest<{ conversation: ConversationRecord }>("/conversations", {
    method: "POST",
    session,
    body: { title },
  });
}

export async function listMessages(session: Session, conversationId: string) {
  return workspaceRequest<ConversationMessagesResponse>(
    `/messages?conversationId=${encodeURIComponent(conversationId)}`,
    { session }
  );
}

export async function completeWorkspaceChat(
  session: Session,
  payload: {
    conversationId?: string;
    content: string;
    routingMode: "auto" | "manual";
    provider?: "openai" | "anthropic" | "gemini";
    model?: string;
  }
) {
  return workspaceRequest<ChatCompletionResponse>("/chat/complete", {
    method: "POST",
    session,
    body: payload,
  });
}

export function getWorkspaceErrorMessage(error: unknown) {
  return getAuthErrorMessage(error);
}
