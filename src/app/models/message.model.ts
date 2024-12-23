// message.model.ts
export interface Message {
  type: "CHAT" | "JOIN" | "LEAVE";
  content: string;
  sender: string;
  receiver?: string;
  timestamp: Date;
  senderProfilePicture?: string;
}
