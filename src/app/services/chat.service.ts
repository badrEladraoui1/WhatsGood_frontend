import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable, of } from "rxjs";
import { User } from "../models/user.model";
import { Message } from "../models/message.model";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private readonly API_URL = "http://localhost:8081/api";
  private stompClient: Client | null = null;
  private messages = new BehaviorSubject<Message[]>([]);
  private contacts = new BehaviorSubject<User[]>([]);

  constructor(private http: HttpClient) {}

  connect(username: string): void {
    const socket = new SockJS(`${this.API_URL}/ws`);

    this.stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("Connected to WebSocket");
        this.subscribeToPublicChat();
        this.subscribeToPrivateChat(username);
      },
      // Add debug info
      debug: (str) => {
        console.log("STOMP Debug:", str);
      },
    });

    this.stompClient.activate();
  }

  private subscribeToPublicChat(): void {
    this.stompClient?.subscribe("/topic/public", (message) => {
      const receivedMessage = JSON.parse(message.body);
      this.messages.next([...this.messages.value, receivedMessage]);
    });
  }

  private subscribeToPrivateChat(username: string): void {
    this.stompClient?.subscribe(
      `/user/${username}/queue/messages`,
      (message) => {
        const receivedMessage = JSON.parse(message.body);
        this.messages.next([...this.messages.value, receivedMessage]);
      }
    );
  }

  disconnect(): void {
    this.stompClient?.deactivate();
  }

  sendMessage(message: Message): void {
    if (this.stompClient?.connected) {
      this.stompClient.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(message),
      });
    }
  }

  sendPrivateMessage(receiver: string, content: string): void {
    if (this.stompClient?.connected) {
      const message = {
        type: "CHAT",
        content: content,
        receiver: receiver,
        timestamp: new Date(),
      };

      this.stompClient.publish({
        destination: "/app/chat.private",
        body: JSON.stringify(message),
      });
    }
  }

  onMessage(): Observable<Message[]> {
    return this.messages.asObservable();
  }

  private getToken(): string | null {
    const currentUser = localStorage.getItem("currentUser");
    return currentUser ? JSON.parse(currentUser).token : null;
  }

  getContacts(): Observable<User[]> {
    const token = localStorage.getItem("currentUser")
      ? JSON.parse(localStorage.getItem("currentUser")!).token
      : null;

    if (!token) {
      return of([]);
    }

    const headers = new HttpHeaders().set("Authorization", `Bearer ${token}`);

    return this.http.get<User[]>(`${this.API_URL}/chatters`, { headers });
  }
}
