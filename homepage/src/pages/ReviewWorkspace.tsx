import {
  FormEvent,
  KeyboardEvent,
  startTransition,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  loadDocxFile,
  normalizeSelectionText,
  renderDocxPreview,
} from "../features/review/docx";
import { requestReviewResponse } from "../features/review/anthropic";
import { loadProviderConfig } from "../features/review/providerConfig";
import type {
  ChatMessage,
  SelectedExcerpt,
  UploadedDoc,
} from "../features/review/types";

export default function ReviewWorkspace() {
  const fileInputId = "review-docx-upload";
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const composerFormRef = useRef<HTMLFormElement | null>(null);
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDoc | null>(null);
  const [selectedExcerpt, setSelectedExcerpt] = useState<SelectedExcerpt | null>(
    null
  );
  const [providerConfig] = useState(() => loadProviderConfig());
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isSending, setIsSending] = useState(false);

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
  });

  async function handleFileChange(file: File | undefined) {
    if (!file) {
      return;
    }

    setIsRendering(true);
    setUploadError(null);
    setChatError(null);

    try {
      const nextDoc = await loadDocxFile(file);

      startTransition(() => {
        setUploadedDoc(nextDoc);
        setSelectedExcerpt(null);
        setMessages([]);
        setQuestion("");
      });
    } catch (error) {
      setUploadedDoc(null);
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
      return;
    }

    const range = selection.getRangeAt(0);
    const text = normalizeSelectionText(selection.toString());

    if (
      !text ||
      selection.isCollapsed ||
      !container.contains(range.commonAncestorContainer)
    ) {
      return;
    }

    setSelectedExcerpt({ text });
    setChatError(null);
  }

  function clearSelection() {
    window.getSelection()?.removeAllRanges();
    setSelectedExcerpt(null);
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

  return (
    <section className="review-page">
      <div className="review-layout">
        <aside className="review-column review-column-document">
          <div className="review-panel review-panel-document">
            <div className="review-panel-header">
              <div>
                <span className="pill">DOCX Review</span>
                <h1 className="review-title">Upload and inspect the contract</h1>
                <p className="review-subtitle">
                  Import a `.docx`, then highlight any passage to use it as chat
                  context.
                </p>
              </div>
              <label className="button review-upload-button" htmlFor={fileInputId}>
                {isRendering ? "Rendering..." : "Upload DOCX"}
              </label>
            </div>
            <input
              id={fileInputId}
              aria-label="Upload a DOCX file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="review-file-input"
              disabled={isRendering}
              onChange={(event) => handleFileChange(event.target.files?.[0])}
              type="file"
            />
            <div className="review-document-toolbar">
              <div className="review-document-meta">
                {uploadedDoc ? (
                  <>
                    <div className="review-meta-chip">
                      <span className="review-meta-label">File</span>
                      <strong>{uploadedDoc.name}</strong>
                    </div>
                    <div className="review-meta-chip">
                      <span className="review-meta-label">Selection</span>
                      <strong>{selectedExcerpt ? "Active" : "None"}</strong>
                    </div>
                    <div className="review-meta-chip">
                      <span className="review-meta-label">Size</span>
                      <strong>{formatFileSize(uploadedDoc.size)}</strong>
                    </div>
                  </>
                ) : (
                  <p className="review-empty-note">
                    No document loaded yet. Start by uploading a `.docx` contract.
                  </p>
                )}
              </div>
              {uploadError ? (
                <p className="review-alert review-alert-error" role="alert">
                  {uploadError}
                </p>
              ) : null}
              <div className="review-selection-bar">
                <p className="review-composer-note">Highlight text to use it in chat.</p>
                <button
                  className="button ghost"
                  disabled={!selectedExcerpt}
                  onClick={clearSelection}
                  type="button"
                >
                  Clear selection
                </button>
              </div>
            </div>
            <div
              ref={viewerRef}
              aria-label="Rendered DOCX preview"
              className="review-document-viewer"
              onKeyUp={captureSelection}
              onMouseUp={captureSelection}
            >
              {uploadedDoc ? null : (
                <div className="review-placeholder">
                  <p className="review-placeholder-title">Rendered DOCX preview</p>
                  <p>
                    Upload a document, then highlight any sentence or clause to
                    use it in chat.
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>
        <section className="review-column review-column-chat">
          <div className="review-panel review-panel-chat">
            <div className="review-panel-header review-chat-header">
              <div>
                <span className="pill">Agent Chat</span>
                <h2 className="review-title">Ask about the selected language</h2>
              </div>
              <Link className="button ghost" to="/review/settings">
                Connection
              </Link>
            </div>
            <div className="review-chat-stack">
              <div className="review-context-card">
                <p className="review-context-label">Selected context</p>
                {selectedExcerpt ? (
                  <>
                    <p className="review-context-title">Highlighted excerpt</p>
                    <p className="review-context-text">{selectedExcerpt.text}</p>
                  </>
                ) : (
                  <p className="review-empty-note">
                    Highlight text on the left to set the active chat context.
                  </p>
                )}
              </div>

              <div className="review-chat-log-shell">
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
                      <p className="review-placeholder-title">
                        Conversation will appear here
                      </p>
                      <p>
                        Ask for a risk summary, a plain-English explanation, or
                        drafting help tied to the highlighted text.
                      </p>
                    </div>
                  )}
                  {isSending ? (
                    <div className="review-message review-message-assistant is-loading">
                      <div className="review-message-meta">
                        <span>Agent</span>
                        <span>Working</span>
                      </div>
                      <p>Reviewing the highlighted contract language...</p>
                    </div>
                  ) : null}
                </div>
              </div>

              {chatError ? (
                <p className="review-alert review-alert-error" role="alert">
                  {chatError}
                </p>
              ) : null}
              {!hasApiKey ? (
                <p className="review-alert">
                  No provider connection is configured. Open Connection to set a
                  saved key or rely on env defaults.
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
                    Only the highlighted excerpt is sent with this question.
                  </p>
                  <button
                    className="button"
                    disabled={composerDisabled}
                    type="submit"
                  >
                    {isSending ? "Sending..." : "Ask agent"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function formatFileSize(size: number): string {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}
