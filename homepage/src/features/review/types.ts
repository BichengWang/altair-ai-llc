export interface SelectedExcerpt {
  text: string;
}

export interface UploadedDoc {
  id: string;
  name: string;
  size: number;
  data: ArrayBuffer;
  uploadedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  selectedText?: string;
}

export interface ReviewChatRequest {
  apiKey: string;
  baseUrl: string;
  documentName: string;
  model: string;
  selectedExcerpt: SelectedExcerpt;
  question: string;
  history: Array<Pick<ChatMessage, "role" | "content">>;
}
