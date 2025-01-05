export interface Message {
  type: "CHAT" | "FILE" | "JOIN" | "LEAVE" | "GROUP_CHAT";
  content: string;
  groupId?: number;
  sender: string;
  receiver?: string;
  timestamp: Date;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
}

export interface ChatMessage {
  type: "CHAT" | "FILE" | "JOIN" | "LEAVE";
  content: string;
  sender: string;
  receiver: string;
  timestamp: Date;
  fileName?: string;
  fileType?: string;
  audioUrl?: string;
  audioType?: string;
}
