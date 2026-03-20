import type { ReviewChatRequest } from "./types";

const HISTORY_LIMIT = 8;

interface OpenAiCompatibleResponse {
  choices?: Array<{
    message?: {
      content?:
        | string
        | Array<{
            type?: string;
            text?: string;
          }>;
    };
  }>;
  error?: {
    message?: string;
  };
}

interface ParsedResponseBody {
  json: OpenAiCompatibleResponse | null;
  rawText: string;
}

export async function requestReviewResponse({
  apiKey,
  baseUrl,
  documentName,
  documentContext,
  model,
  selectedExcerpt,
  question,
  history,
}: ReviewChatRequest): Promise<string> {
  if (!apiKey) {
    throw new Error(
      "Enter a compatible API key or set VITE_ANTHROPIC_API_KEY."
    );
  }

  if (!model) {
    throw new Error("Choose a model or set VITE_ANTHROPIC_MODEL.");
  }

  const messages = [
    {
      role: "system" as const,
      content:
        "You are a contract review assistant. Use the uploaded document context to interpret the selected excerpt, but answer the user's question about the selected excerpt first. If the selection is insufficient even with the broader context, say so plainly and suggest what the user should select next.",
    },
    ...history.slice(-HISTORY_LIMIT).map((message) => ({
      role: message.role,
      content: message.selectedText
        ? ["Selected excerpt for this turn:", message.selectedText, "", message.content].join(
            "\n"
          )
        : message.content,
    })),
    {
      role: "user" as const,
      content: [
        `Document: ${documentName}`,
        "Selected excerpt:",
        selectedExcerpt.text,
        "",
        documentContext,
        "",
        `Question: ${question}`,
      ].join("\n"),
    },
  ];

  let response: Response;
  const endpoint = `${normalizeBaseUrl(baseUrl)}/chat/completions`;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_completion_tokens: 700,
        messages,
      }),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      if (isAnthropicCompatibilityUrl(baseUrl)) {
        throw new Error(
          `The current origin (${window.location.origin}) is blocked from calling Anthropic's compatibility API directly from the browser. Use a server-side proxy, or switch the review connection to an OpenAI-compatible endpoint that allows this origin.`
        );
      }

      throw new Error(
        "Compatible API request failed from the browser. Check the base URL and whether that provider allows your current origin."
      );
    }

    throw error;
  }

  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(
      body.json?.error?.message ??
        inferHtmlError(body.rawText) ??
        "Compatible API request failed. Check the API key, base URL, model, and allowed origin."
    );
  }

  if (!body.json) {
    throw new Error(
      "Compatible API returned a non-JSON response. Check the base URL and endpoint path."
    );
  }

  const content = body.json.choices?.[0]?.message?.content;
  const text =
    typeof content === "string"
      ? content.trim()
      : (content ?? [])
          .filter((item) => item.type === "text" && item.text)
          .map((item) => item.text?.trim())
          .filter(Boolean)
          .join("\n\n");

  if (!text) {
    throw new Error("The compatible API returned an empty reply.");
  }

  return text;
}

function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, "");

  if (!trimmed) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const pathname = url.pathname.replace(/\/+$/, "") || "";

    if (
      (url.hostname === "api.openai.com" || url.hostname === "api.anthropic.com") &&
      pathname === ""
    ) {
      url.pathname = "/v1";
      return url.toString().replace(/\/+$/, "");
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

async function parseResponseBody(response: Response): Promise<ParsedResponseBody> {
  const rawText = await response.text();

  if (!rawText.trim()) {
    return { json: null, rawText: "" };
  }

  try {
    return {
      json: JSON.parse(rawText) as OpenAiCompatibleResponse,
      rawText,
    };
  } catch {
    return {
      json: null,
      rawText,
    };
  }
}

function inferHtmlError(rawText: string): string | null {
  if (!/^\s*</.test(rawText)) {
    return null;
  }

  return "Compatible API returned HTML instead of JSON. This usually means the base URL is wrong (for example, pointed at a website instead of an API endpoint).";
}

function isAnthropicCompatibilityUrl(baseUrl: string) {
  return /(^https?:\/\/)?api\.anthropic\.com\b/i.test(normalizeBaseUrl(baseUrl));
}
