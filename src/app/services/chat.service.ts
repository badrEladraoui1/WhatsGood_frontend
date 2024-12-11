import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { User } from "../models/user.model";
import { Message } from "../models/message.model";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private messages = new BehaviorSubject<Message[]>([]);
  private contacts = new BehaviorSubject<User[]>([
    {
      id: 1,
      username: "John Doe",
      profilePicture: "https://i.pravatar.cc/150?img=1",
      isOnline: true,
      lastMessage: "Hey, how are you?",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: 2,
      username: "Jane Smith",
      profilePicture: "https://i.pravatar.cc/150?img=2",
      isOnline: false,
      lastMessage: "See you tomorrow!",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    },
  ]);

  connect(username: string): void {
    console.log("Connected as:", username);
  }

  disconnect(): void {
    console.log("Disconnected");
  }

  onMessage(): Observable<Message> {
    return new Observable((subscriber) => {
      // Mock message reception
      setTimeout(() => {
        subscriber.next({
          type: "CHAT",
          content: "Hello!",
          sender: "John Doe",
          timestamp: new Date(),
        });
      }, 1000);
    });
  }

  onUserStatusChange(): Observable<{ username: string; isOnline: boolean }> {
    return new Observable((subscriber) => {
      // Mock status changes
      setTimeout(() => {
        subscriber.next({ username: "John Doe", isOnline: true });
      }, 1000);
    });
  }

  getMessageHistory(username: string): Observable<Message[]> {
    // Mock message history
    const mockMessages: Message[] = [
      {
        type: "CHAT",
        content: "Hey!",
        sender: username,
        receiver: "John Doe",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        type: "CHAT",
        content: "Hello! How are you?",
        sender: "John Doe",
        receiver: username,
        timestamp: new Date(Date.now() - 1000 * 60 * 4),
      },
    ];
    this.messages.next(mockMessages);
    return this.messages.asObservable();
  }

  sendMessage(message: Message): void {
    this.messages.next([...this.messages.value, message]);
  }

  getContacts(): Observable<User[]> {
    return this.contacts.asObservable();
  }
}
