import type { UploadedDoc } from "./types";

export async function loadDocxFile(file: File): Promise<UploadedDoc> {
  const data = await toArrayBuffer(file);

  return {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    data,
    uploadedAt: new Date().toISOString(),
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

async function toArrayBuffer(file: Blob): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === "function") {
    return file.arrayBuffer();
  }

  return new Response(file).arrayBuffer();
}
