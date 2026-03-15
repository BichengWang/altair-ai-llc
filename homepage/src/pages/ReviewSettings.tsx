import { FormEvent, useId, useState } from "react";
import { Link } from "react-router-dom";
import {
  clearProviderConfig,
  emptyProviderConfig,
  loadProviderConfig,
  saveProviderConfig,
} from "../features/review/providerConfig";

export default function ReviewSettings() {
  const apiKeyInputId = useId();
  const modelInputId = useId();
  const baseUrlInputId = useId();
  const [config, setConfig] = useState(() => loadProviderConfig());
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveProviderConfig({
      apiKey: config.apiKey.trim(),
      model: config.model.trim(),
      baseUrl: config.baseUrl.trim(),
    });
    setSavedMessage("Saved for this browser.");
  }

  function handleReset() {
    clearProviderConfig();
    setConfig(emptyProviderConfig());
    setSavedMessage("Saved values cleared.");
  }

  return (
    <section className="review-page review-settings-page">
      <div className="review-settings-shell">
        <div className="review-panel review-panel-settings">
          <div className="review-panel-header review-settings-header">
            <div>
              <span className="pill">Connection</span>
              <h1 className="review-title">Provider settings</h1>
              <p className="review-subtitle">
                Configure the compatible API connection used by the review
                workspace in this browser.
              </p>
            </div>
            <Link className="button ghost" to="/review">
              Back to review
            </Link>
          </div>

          <form className="review-settings-form" onSubmit={handleSubmit}>
            <div className="review-key-field">
              <label className="review-composer-label" htmlFor={apiKeyInputId}>
                Compatible API key
              </label>
              <input
                id={apiKeyInputId}
                className="input review-key-input"
                onChange={(event) =>
                  setConfig((current) => ({
                    ...current,
                    apiKey: event.target.value,
                  }))
                }
                placeholder="sk-..."
                spellCheck={false}
                type="password"
                value={config.apiKey}
              />
            </div>

            <div className="review-settings-grid">
              <div className="review-key-field">
                <label className="review-composer-label" htmlFor={modelInputId}>
                  Model
                </label>
                <input
                  id={modelInputId}
                  className="input review-key-input"
                  onChange={(event) =>
                    setConfig((current) => ({
                      ...current,
                      model: event.target.value,
                    }))
                  }
                  placeholder="gpt-5.4, claude-sonnet, ..."
                  spellCheck={false}
                  type="text"
                  value={config.model}
                />
              </div>

              <div className="review-key-field">
                <label className="review-composer-label" htmlFor={baseUrlInputId}>
                  Base URL
                </label>
                <input
                  id={baseUrlInputId}
                  className="input review-key-input"
                  onChange={(event) =>
                    setConfig((current) => ({
                      ...current,
                      baseUrl: event.target.value,
                    }))
                  }
                  placeholder="https://api.openai.com/v1"
                  spellCheck={false}
                  type="text"
                  value={config.baseUrl}
                />
              </div>
            </div>

            <p className="review-composer-note">
              Leave any field empty to fall back to the matching Vite env value.
            </p>
            {savedMessage ? <p className="review-alert">{savedMessage}</p> : null}

            <div className="review-settings-actions">
              <button className="button" type="submit">
                Save settings
              </button>
              <button className="button ghost" onClick={handleReset} type="button">
                Clear saved values
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
