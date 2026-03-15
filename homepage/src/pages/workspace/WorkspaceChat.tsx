import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  completeWorkspaceChat,
  createConversation,
  getWorkspaceErrorMessage,
  listConversations,
  listMessages,
} from "../../lib/workspaceApi";
import type {
  ConversationRecord,
  MessageRecord,
  ProviderName,
  RoutingMode,
} from "../../types/workspace";

const PROVIDER_CHOICES: Array<{ value: ProviderName; label: string }> = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "gemini", label: "Gemini" },
];

function formatConversationTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function WorkspaceChat() {
  const { session } = useAuth();
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [draft, setDraft] = useState("");
  const [routingMode, setRoutingMode] = useState<RoutingMode>("auto");
  const [provider, setProvider] = useState<ProviderName>("openai");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sidebarError, setSidebarError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [routeSummary, setRouteSummary] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const data = await listConversations(session);

        if (!active) {
          return;
        }

        setConversations(data.conversations);
        setSelectedConversationId((current) => current ?? data.conversations[0]?.id ?? null);
        setSidebarError(null);
      } catch (caughtError) {
        if (active) {
          setSidebarError(getWorkspaceErrorMessage(caughtError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [session]);

  useEffect(() => {
    if (!session || !selectedConversationId) {
      setMessages([]);
      return;
    }

    let active = true;

    const load = async () => {
      try {
        const data = await listMessages(session, selectedConversationId);

        if (active) {
          setMessages(data.messages);
          setChatError(null);
        }
      } catch (caughtError) {
        if (active) {
          setChatError(getWorkspaceErrorMessage(caughtError));
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [selectedConversationId, session]);

  const handleNewConversation = async () => {
    if (!session) {
      return;
    }

    try {
      const data = await createConversation(session, "New routed chat");
      setConversations((current) => [data.conversation, ...current]);
      setSelectedConversationId(data.conversation.id);
      setMessages([]);
    } catch (caughtError) {
      setSidebarError(getWorkspaceErrorMessage(caughtError));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session) {
      setChatError("You must be signed in to chat.");
      return;
    }

    if (!draft.trim()) {
      setChatError("Enter a prompt before sending.");
      return;
    }

    setSending(true);
    setChatError(null);
    setRouteSummary(null);

    try {
      const response = await completeWorkspaceChat(session, {
        conversationId: selectedConversationId ?? undefined,
        content: draft.trim(),
        routingMode,
        provider: routingMode === "manual" ? provider : undefined,
        model: routingMode === "manual" && model.trim() ? model.trim() : undefined,
      });

      setConversations((current) => {
        const filtered = current.filter((conversation) => conversation.id !== response.conversation.id);
        return [response.conversation, ...filtered];
      });
      setSelectedConversationId(response.conversation.id);
      setMessages((current) => [...current, response.userMessage, response.assistantMessage]);
      setDraft("");
      setRouteSummary(
        `${response.routingMode === "auto" ? "Auto-routed" : "Manual route"} via ${response.selectedProvider} / ${response.selectedModel} • ${response.usage.totalTokens.toLocaleString("en-US")} tokens`
      );
    } catch (caughtError) {
      setChatError(getWorkspaceErrorMessage(caughtError));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="workspace-chat-page">
      <aside className="workspace-chat-sidebar">
        <div className="workspace-chat-sidebar-header">
          <div>
            <span className="pill">Chat</span>
            <h2>Conversations</h2>
          </div>
          <button className="button ghost" type="button" onClick={() => void handleNewConversation()}>
            New chat
          </button>
        </div>
        {sidebarError ? <p className="status-banner error">{sidebarError}</p> : null}
        {loading ? <p>Loading chats...</p> : null}
        <div className="workspace-conversation-list">
          {conversations.map((conversation) => (
            <button
              type="button"
              key={conversation.id}
              className={`workspace-conversation-card${selectedConversationId === conversation.id ? " active" : ""}`}
              onClick={() => setSelectedConversationId(conversation.id)}
            >
              <strong>{conversation.title}</strong>
              <span>{formatConversationTime(conversation.last_message_at)}</span>
            </button>
          ))}
          {!loading && !conversations.length ? (
            <div className="workspace-empty-state">
              <p>No conversations yet.</p>
              <p>Start with a question after adding at least one valid provider key.</p>
            </div>
          ) : null}
        </div>
      </aside>
      <div className="workspace-chat-main">
        <div className="workspace-chat-header workspace-panel">
          <div>
            <span className="pill">Routing</span>
            <h2>Managed LLM chat</h2>
            <p>Auto-routing considers task fit, provider health, and remaining monthly token cap.</p>
          </div>
          <div className="workspace-routing-controls">
            <label>
              Mode
              <select className="input" value={routingMode} onChange={(event) => setRoutingMode(event.target.value as RoutingMode)}>
                <option value="auto">Auto route</option>
                <option value="manual">Manual override</option>
              </select>
            </label>
            <label>
              Provider
              <select
                className="input"
                value={provider}
                onChange={(event) => setProvider(event.target.value as ProviderName)}
                disabled={routingMode === "auto"}
              >
                {PROVIDER_CHOICES.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Model
              <input
                className="input"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                disabled={routingMode === "auto"}
                placeholder="Optional model override"
              />
            </label>
          </div>
        </div>
        <div className="workspace-message-thread workspace-panel">
          {messages.length ? (
            messages.map((message) => (
              <article className={`workspace-message ${message.role}`} key={message.id}>
                <header>
                  <strong>{message.role === "assistant" ? "Altair" : message.role === "system" ? "System" : "You"}</strong>
                  <span>
                    {message.provider ? `${message.provider} / ${message.model ?? "default"}` : message.model ?? "profile"}
                  </span>
                </header>
                <p>{message.content}</p>
              </article>
            ))
          ) : (
            <div className="workspace-empty-state">
              <p>No messages yet.</p>
              <p>Ask for summarization, coding help, brainstorming, or anything else the router should place on the best provider.</p>
            </div>
          )}
        </div>
        <form className="workspace-panel workspace-composer" onSubmit={handleSubmit}>
          <label>
            Prompt
            <textarea
              className="input workspace-textarea"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Explain the tradeoffs of using multiple providers for a product launch..."
              rows={5}
            />
          </label>
          {routeSummary ? <p className="status-banner success">{routeSummary}</p> : null}
          {chatError ? <p className="status-banner error">{chatError}</p> : null}
          <div className="workspace-composer-actions">
            <p>Messages are sent using the Altair-managed key and routed against your validated provider pool.</p>
            <button className="button" type="submit" disabled={sending}>
              {sending ? "Routing..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
