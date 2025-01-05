export interface Group {
  id: number;
  name: string;
  description: string;
  creatorUsername: string;
  members: string[];
  groupPicture?: string;
  createdAt: Date;
  lastMessage?: string;
  lastMessageTime?: Date;
}
