import {
  FormEvent,
  KeyboardEvent,
  startTransition,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { requestReviewResponse } from "../features/review/anthropic";
import {
  loadDocxFile,
  normalizeSelectionText,
  renderDocxPreview,
} from "../features/review/docx";
import {
  clearProviderConfig,
  emptyProviderConfig,
  loadProviderConfig,
  saveProviderConfig,
} from "../features/review/providerConfig";
import type {
  ChatMessage,
  SelectedExcerpt,
  UploadedDoc,
} from "../features/review/types";
import { buildAppPath, getActiveApp } from "../lib/runtime";

type ReviewWorkspaceProps = {
  initialConnectionOpen?: boolean;
  settingsEntry?: boolean;
};

type PendingSelection = {
  text: string;
  top: number;
  left: number;
};

export default function ReviewWorkspace({
  initialConnectionOpen = false,
  settingsEntry = false,
}: ReviewWorkspaceProps) {
  const activeApp = getActiveApp();
  const isWorkspaceApp = activeApp === "workspace";
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputId = "review-docx-upload";
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const composerFormRef = useRef<HTMLFormElement | null>(null);
  const questionInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDoc | null>(null);
  const [selectedExcerpt, setSelectedExcerpt] = useState<SelectedExcerpt | null>(
    null
  );
  const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(
    null
  );
  const [providerConfig, setProviderConfig] = useState(() => loadProviderConfig());
  const [isConnectionOpen, setIsConnectionOpen] = useState(initialConnectionOpen);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const reviewHomePath = buildAppPath("/review", { app: activeApp });
  const workspaceChatPath = buildAppPath("/chat", { app: "workspace" });
  const workspaceReviewPath = buildAppPath("/review", { app: "workspace" });
  const workspaceLoginPath = buildAppPath("/login", { app: "workspace" });
  const marketingHomePath = buildAppPath("/", { app: "marketing" });

  const effectiveApiKey =
    providerConfig.apiKey.trim() ||
    import.meta.env.VITE_LLM_API_KEY ||
    import.meta.env.VITE_ANTHROPIC_API_KEY ||
    "";
  const effectiveModel =
    providerConfig.model.trim() ||
    import.meta.env.VITE_LLM_MODEL ||
    import.meta.env.VITE_ANTHROPIC_MODEL ||
    "gpt-4.1-mini";
  const effectiveBaseUrl =
    providerConfig.baseUrl.trim() ||
    import.meta.env.VITE_LLM_BASE_URL ||
    import.meta.env.VITE_OPENAI_COMPAT_BASE_URL ||
    "https://api.openai.com/v1";
  const hasApiKey = Boolean(effectiveApiKey);

  useEffect(() => {
    if (!uploadedDoc || !viewerRef.current) {
      return;
    }

    let isCancelled = false;

    async function renderDocument() {
      setIsRendering(true);
      setUploadError(null);

      try {
        await renderDocxPreview(uploadedDoc.data, viewerRef.current!);

        if (!isCancelled) {
          setPendingSelection(null);
          setSelectedExcerpt(null);
        }
      } catch (error) {
        if (isCancelled) {
          return;
        }

        viewerRef.current!.innerHTML = "";
        setUploadError(
          error instanceof Error
            ? error.message
            : "The DOCX could not be rendered. Try another file."
        );
      } finally {
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    }

    void renderDocument();

    return () => {
      isCancelled = true;
    };
  }, [uploadedDoc]);

  useEffect(() => {
    const handleSelectionChange = () => {
      captureSelection();
    };

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  async function handleFileChange(file: File | undefined) {
    if (!file) {
      return;
    }

    setIsRendering(true);
    setUploadError(null);
    setChatError(null);
    setSavedMessage(null);

    try {
      const nextDoc = await loadDocxFile(file);

      startTransition(() => {
        setUploadedDoc(nextDoc);
        setPendingSelection(null);
        setSelectedExcerpt(null);
        setMessages([]);
        setQuestion("");
      });
    } catch (error) {
      setUploadedDoc(null);
      setPendingSelection(null);
      setSelectedExcerpt(null);
      setMessages([]);
      setUploadError(
        error instanceof Error
          ? error.message
          : "The DOCX could not be rendered. Try another file."
      );
      setIsRendering(false);
    }
  }

  function captureSelection() {
    const container = viewerRef.current;
    const selection = window.getSelection();

    if (!container || !selection || selection.rangeCount === 0) {
      setPendingSelection(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const text = normalizeSelectionText(selection.toString());

    if (
      !text ||
      selection.isCollapsed ||
      !container.contains(range.commonAncestorContainer)
    ) {
      setPendingSelection(null);
      return;
    }

    const rect = getSelectionRect(range, container);
    const containerRect = container.getBoundingClientRect();
    const top = clamp(
      rect.top - containerRect.top + container.scrollTop - 48,
      12,
      container.scrollHeight - 12
    );
    const left = clamp(
      rect.left -
        containerRect.left +
        container.scrollLeft +
        Math.max(rect.width / 2, 72),
      80,
      Math.max(80, container.clientWidth - 80)
    );

    setPendingSelection({
      text,
      top,
      left,
    });
    setChatError(null);
  }

  function activateSelectedExcerpt() {
    if (!pendingSelection) {
      return;
    }

    setSelectedExcerpt({ text: pendingSelection.text });
    setPendingSelection(null);
    questionInputRef.current?.focus();
  }

  function clearSelection() {
    window.getSelection()?.removeAllRanges();
    setPendingSelection(null);
    setSelectedExcerpt(null);
  }

  function openConnection() {
    setSavedMessage(null);
    setIsConnectionOpen(true);
  }

  function closeConnection() {
    setSavedMessage(null);

    if (settingsEntry) {
      navigate(reviewHomePath, { replace: true });
      return;
    }

    setIsConnectionOpen(false);
  }

  function handleConnectionSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveProviderConfig({
      apiKey: providerConfig.apiKey.trim(),
      model: providerConfig.model.trim(),
      baseUrl: providerConfig.baseUrl.trim(),
    });
    setProviderConfig(loadProviderConfig());
    setSavedMessage("Saved for this browser.");
  }

  function handleConnectionReset() {
    clearProviderConfig();
    setProviderConfig(emptyProviderConfig());
    setSavedMessage("Saved values cleared.");
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    composerFormRef.current?.requestSubmit();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!uploadedDoc || !selectedExcerpt || !question.trim() || isSending) {
      return;
    }

    const prompt = question.trim();
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
      createdAt: new Date().toISOString(),
      selectedText: selectedExcerpt.text,
    };

    setChatError(null);
    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setIsSending(true);

    try {
      const reply = await requestReviewResponse({
        apiKey: effectiveApiKey,
        baseUrl: effectiveBaseUrl,
        documentName: uploadedDoc.name,
        model: effectiveModel,
        selectedExcerpt,
        question: prompt,
        history: messages.map(({ role, content }) => ({ role, content })),
      });

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
          createdAt: new Date().toISOString(),
          selectedText: selectedExcerpt.text,
        },
      ]);
    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : "The assistant could not answer your question."
      );
      setQuestion(prompt);
      setMessages((current) =>
        current.filter((message) => message.id !== userMessage.id)
      );
    } finally {
      setIsSending(false);
    }
  }

  const composerDisabled =
    !uploadedDoc ||
    !selectedExcerpt ||
    !question.trim() ||
    !hasApiKey ||
    isSending;
  const utilityLink = isWorkspaceApp
    ? {
        label: "Back to chat",
        to: workspaceChatPath,
      }
    : {
        label: user ? "Open workspace" : "Workspace sign in",
        to: user ? workspaceReviewPath : workspaceLoginPath,
      };

  return (
    <section className="review-page">
      <input
        id={fileInputId}
        aria-label="Upload a DOCX file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="review-file-input"
        disabled={isRendering}
        onChange={(event) => handleFileChange(event.target.files?.[0])}
        type="file"
      />

      <div className="review-shell">
        <header className="review-topbar">
          <div className="review-topbar-brand">
            <Link
              className="review-topbar-link"
              to={isWorkspaceApp ? workspaceChatPath : marketingHomePath}
            >
              {isWorkspaceApp ? "Altair Workspace" : "Altair Review"}
            </Link>
            <div className="review-topbar-document">
              <strong>{uploadedDoc?.name ?? "No document loaded"}</strong>
              <span>
                {uploadedDoc
                  ? `${formatFileSize(uploadedDoc.size)}${
                      selectedExcerpt ? " • context set" : ""
                    }`
                  : "Upload a .docx and highlight a clause to ask about it."}
              </span>
            </div>
          </div>
          <div className="review-topbar-actions">
            <label
              className={`button ghost${isRendering ? " is-disabled" : ""}`}
              htmlFor={fileInputId}
            >
              {isRendering ? "Rendering..." : uploadedDoc ? "Replace DOCX" : "Upload DOCX"}
            </label>
            <button className="button ghost" onClick={openConnection} type="button">
              Connection
            </button>
            <Link className="button ghost" to={utilityLink.to}>
              {utilityLink.label}
            </Link>
          </div>
        </header>

        <div className="review-workspace">
          <section className="review-document-pane">
            {uploadError ? (
              <p className="review-alert review-alert-error" role="alert">
                {uploadError}
              </p>
            ) : null}

            <div className="review-document-stage">
              <div
                ref={viewerRef}
                aria-label="Rendered DOCX preview"
                className="review-document-viewer"
                onKeyUp={captureSelection}
                onMouseUp={captureSelection}
                onScroll={() => setPendingSelection(null)}
              >
                {uploadedDoc ? null : (
                  <div className="review-placeholder review-placeholder-document">
                    <p className="review-placeholder-title">Drop into the document</p>
                    <p>Upload a DOCX from the top bar, then highlight one clause to ask the agent.</p>
                  </div>
                )}
              </div>

              {pendingSelection ? (
                <div
                  className="review-selection-float"
                  style={{
                    left: `${pendingSelection.left}px`,
                    top: `${pendingSelection.top}px`,
                  }}
                >
                  <button
                    className="button"
                    onClick={activateSelectedExcerpt}
                    type="button"
                  >
                    Ask about this
                  </button>
                </div>
              ) : null}
            </div>
          </section>

          <aside className="review-chat-rail">
            <section className="review-context-panel">
              <div className="review-rail-header">
                <span className="review-rail-label">Selected excerpt</span>
                {selectedExcerpt ? (
                  <button className="review-inline-action" onClick={clearSelection} type="button">
                    Clear
                  </button>
                ) : null}
              </div>
              {selectedExcerpt ? (
                <p className="review-context-text">{selectedExcerpt.text}</p>
              ) : (
                <p className="review-empty-note">
                  Highlight text in the document, then use the floating action to set chat context.
                </p>
              )}
            </section>

            <section className="review-chat-log-shell">
              <div className="review-chat-log" aria-live="polite">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <article
                      key={message.id}
                      className={`review-message review-message-${message.role}`}
                    >
                      <div className="review-message-meta">
                        <span>{message.role === "assistant" ? "Agent" : "You"}</span>
                        <time dateTime={message.createdAt}>
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>
                      <p>{message.content}</p>
                    </article>
                  ))
                ) : (
                  <div className="review-placeholder review-placeholder-chat">
                    <p className="review-placeholder-title">Conversation</p>
                    <p>Ask for risk, plain-English explanation, or drafting help tied to the selected clause.</p>
                  </div>
                )}

                {isSending ? (
                  <div className="review-message review-message-assistant is-loading">
                    <div className="review-message-meta">
                      <span>Agent</span>
                      <span>Working</span>
                    </div>
                    <p>Reviewing the selected language...</p>
                  </div>
                ) : null}
              </div>
            </section>

            {chatError ? (
              <p className="review-alert review-alert-error" role="alert">
                {chatError}
              </p>
            ) : null}
            {!hasApiKey ? (
              <p className="review-alert">
                No provider connection is configured. Open Connection to set a saved key or rely on env defaults.
              </p>
            ) : null}

            <form
              ref={composerFormRef}
              className="review-composer"
              onSubmit={handleSubmit}
            >
              <label className="review-composer-label" htmlFor="review-question">
                Ask about the selected clause
              </label>
              <textarea
                ref={questionInputRef}
                id="review-question"
                className="input textarea review-textarea"
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder="What risk does this clause create for us?"
                rows={4}
                value={question}
              />
              <div className="review-composer-actions">
                <p className="review-composer-note">
                  Only the selected excerpt is sent with this question.
                </p>
                <button className="button" disabled={composerDisabled} type="submit">
                  {isSending ? "Sending..." : "Ask agent"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      </div>

      {isConnectionOpen ? (
        <div className="review-drawer-shell" role="presentation">
          <button
            aria-label="Close connection settings"
            className="review-drawer-backdrop"
            onClick={closeConnection}
            type="button"
          />
          <aside
            aria-label="Connection settings"
            className="review-drawer"
            role="dialog"
          >
            <div className="review-drawer-header">
              <div>
                <span className="review-rail-label">Connection</span>
                <h2 className="review-drawer-title">Provider settings</h2>
              </div>
              <button className="button ghost" onClick={closeConnection} type="button">
                Close
              </button>
            </div>

            <form className="review-settings-form" onSubmit={handleConnectionSave}>
              <div className="review-key-field">
                <label className="review-composer-label" htmlFor="review-provider-key">
                  Compatible API key
                </label>
                <input
                  id="review-provider-key"
                  className="input review-key-input"
                  onChange={(event) =>
                    setProviderConfig((current) => ({
                      ...current,
                      apiKey: event.target.value,
                    }))
                  }
                  placeholder="sk-..."
                  spellCheck={false}
                  type="password"
                  value={providerConfig.apiKey}
                />
              </div>

              <div className="review-key-field">
                <label className="review-composer-label" htmlFor="review-provider-model">
                  Model
                </label>
                <input
                  id="review-provider-model"
                  className="input review-key-input"
                  onChange={(event) =>
                    setProviderConfig((current) => ({
                      ...current,
                      model: event.target.value,
                    }))
                  }
                  placeholder="gpt-5.4, claude-sonnet, ..."
                  spellCheck={false}
                  type="text"
                  value={providerConfig.model}
                />
              </div>

              <div className="review-key-field">
                <label className="review-composer-label" htmlFor="review-provider-base-url">
                  Base URL
                </label>
                <input
                  id="review-provider-base-url"
                  className="input review-key-input"
                  onChange={(event) =>
                    setProviderConfig((current) => ({
                      ...current,
                      baseUrl: event.target.value,
                    }))
                  }
                  placeholder="https://api.openai.com/v1"
                  spellCheck={false}
                  type="text"
                  value={providerConfig.baseUrl}
                />
              </div>

              <p className="review-composer-note">
                Leave any field empty to fall back to the matching Vite env value.
              </p>
              {savedMessage ? <p className="review-alert">{savedMessage}</p> : null}

              <div className="review-settings-actions">
                <button className="button" type="submit">
                  Save settings
                </button>
                <button className="button ghost" onClick={handleConnectionReset} type="button">
                  Clear saved values
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </section>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getSelectionRect(range: Range, container: HTMLDivElement) {
  if (typeof range.getBoundingClientRect === "function") {
    return range.getBoundingClientRect();
  }

  const node =
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? (range.commonAncestorContainer as Element)
      : range.commonAncestorContainer.parentElement;

  return node?.getBoundingClientRect() ?? container.getBoundingClientRect();
}

function formatFileSize(size: number): string {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}
