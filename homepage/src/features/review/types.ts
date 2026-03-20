export interface SelectedExcerpt {
  text: string;
}

export interface DocumentChunk {
  id: string;
  text: string;
}

export interface UploadedDoc {
  id: string;
  name: string;
  size: number;
  data: ArrayBuffer;
  uploadedAt: string;
  fullText: string;
  chunks: DocumentChunk[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  selectedText?: string;
}

export interface ReviewHistoryMessage {
  role: ChatMessage["role"];
  content: string;
  selectedText?: string;
}

export interface ReviewChatRequest {
  apiKey: string;
  baseUrl: string;
  documentName: string;
  documentContext: string;
  model: string;
  selectedExcerpt: SelectedExcerpt;
  question: string;
  history: ReviewHistoryMessage[];
}
