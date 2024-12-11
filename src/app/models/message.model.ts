// src/app/models/message.model.ts
export interface Message {
  type: "CHAT" | "JOIN" | "LEAVE"; // Updated to match your ChatMessage enum
  content: string;
  sender: string; // Changed from senderId to match backend
  receiver?: string; // Made optional, changed from receiverId
  timestamp: Date; // or LocalDateTime if you're using that type
}
