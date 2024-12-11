// src/app/models/user.model.ts
export interface User {
  id: number; // Changed to number as per your backend
  username: string;
  profilePicture?: string; // Changed from avatar to match backend
  isOnline?: boolean;
  lastMessage?: string;
  lastMessageTime?: Date;
}
