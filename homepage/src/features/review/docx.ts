import JSZip from "jszip";
import type { DocumentChunk, UploadedDoc } from "./types";

const WORD_NAMESPACE = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const MAX_DOCUMENT_CHUNKS = 200;
const MAX_CHUNK_LENGTH = 800;

export async function loadDocxFile(file: File): Promise<UploadedDoc> {
  const data = await toArrayBuffer(file);
  const { chunks, fullText } = await extractDocxText(data);

  return {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    data,
    uploadedAt: new Date().toISOString(),
    fullText,
    chunks,
  };
}

export async function renderDocxPreview(
  data: ArrayBuffer,
  container: HTMLElement
): Promise<void> {
  const { renderAsync } = await import("docx-preview");

  container.innerHTML = "";

  await renderAsync(data.slice(0), container, undefined, {
    className: "review-docx",
    inWrapper: true,
    ignoreWidth: true,
    ignoreHeight: true,
    breakPages: true,
    useBase64URL: true,
  });
}

export function normalizeSelectionText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function buildReviewDocumentContext(
  fullText: string,
  chunks: DocumentChunk[],
  selectedText: string
): string {
  const normalizedSelection = normalizeSelectionText(selectedText);
  const exactMatchIndex = chunks.findIndex(
    (chunk) => normalizeSelectionText(chunk.text) === normalizedSelection
  );
  const containingIndex =
    exactMatchIndex >= 0
      ? exactMatchIndex
      : chunks.findIndex((chunk) =>
          normalizeSelectionText(chunk.text).includes(normalizedSelection)
        );

  const contextParts = [
    formatDocumentSummary(fullText),
    formatRelevantChunks(chunks, containingIndex),
  ].filter(Boolean);

  return contextParts.join("\n\n");
}

async function extractDocxText(
  data: ArrayBuffer
): Promise<{ fullText: string; chunks: DocumentChunk[] }> {
  try {
    const zip = await JSZip.loadAsync(data);
    const documentXml = await zip.file("word/document.xml")?.async("string");

    if (!documentXml) {
      return { fullText: "", chunks: [] };
    }

    const parser = new DOMParser();
    const xml = parser.parseFromString(documentXml, "application/xml");
    const paragraphs = Array.from(xml.getElementsByTagNameNS(WORD_NAMESPACE, "p"))
      .map((paragraph) => normalizeSelectionText(readParagraphText(paragraph)))
      .filter(Boolean);
    const chunks = paragraphs.slice(0, MAX_DOCUMENT_CHUNKS).map((text, index) => ({
      id: `chunk-${index + 1}`,
      text: text.slice(0, MAX_CHUNK_LENGTH),
    }));

    return {
      fullText: paragraphs.join("\n\n"),
      chunks,
    };
  } catch {
    return { fullText: "", chunks: [] };
  }
}

function readParagraphText(paragraph: Element): string {
  return Array.from(paragraph.getElementsByTagNameNS(WORD_NAMESPACE, "t"))
    .map((node) => node.textContent ?? "")
    .join("");
}

function formatDocumentSummary(fullText: string): string {
  if (!fullText) {
    return "Document context: No extractable document text was available from the uploaded DOCX.";
  }

  return [
    "Document context:",
    truncateText(fullText, 6000),
  ].join("\n");
}

function formatRelevantChunks(
  chunks: DocumentChunk[],
  selectedIndex: number
): string {
  if (!chunks.length) {
    return "Relevant chunks: No extractable document chunks were available.";
  }

  if (selectedIndex < 0) {
    return [
      "Relevant chunks:",
      ...chunks.slice(0, 6).map((chunk) => `- ${chunk.text}`),
    ].join("\n");
  }

  const start = Math.max(0, selectedIndex - 2);
  const end = Math.min(chunks.length, selectedIndex + 3);

  return [
    "Relevant chunks near the selection:",
    ...chunks.slice(start, end).map((chunk, offset) => {
      const actualIndex = start + offset;
      const prefix = actualIndex === selectedIndex ? "- [selected-neighbor]" : "-";
      return `${prefix} ${chunk.text}`;
    }),
  ].join("\n");
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

async function toArrayBuffer(file: Blob): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === "function") {
    return file.arrayBuffer();
  }

  return new Response(file).arrayBuffer();
}
