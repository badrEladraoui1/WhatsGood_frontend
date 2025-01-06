import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable, of } from "rxjs";
import { User } from "../models/user.model";
import { Client } from "@stomp/stompjs";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import SockJS from "sockjs-client";
import { Message, ChatMessage } from "../models/message.model";
import { Group } from "../models/groupe.model";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private readonly API_URL = "http://localhost:8081/api";
  private stompClient: Client | null = null;
  private messages = new BehaviorSubject<Message[]>([]);
  private messagesByUser = new Map<string, Message[]>();
  private messagesByGroup = new Map<number, Message[]>();
  private groupsSubject = new BehaviorSubject<Group[]>([]);

  constructor(private http: HttpClient, private authService: AuthService) {}

  connect(username: string): void {
    const socket = new SockJS(`${this.API_URL}/ws`);

    this.stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("Connected to WebSocket");
        this.subscribeToPrivateChat(username);
        this.subscribeToGroupChat(username);
      },
      debug: (str) => {
        console.log("STOMP Debug:", str);
      },
    });

    this.stompClient.activate();
  }

  private subscribeToPrivateChat(username: string): void {
    this.stompClient?.subscribe(
      `/user/${username}/queue/messages`,
      (message) => {
        const receivedMessage = JSON.parse(message.body);
        // Store message in appropriate conversation
        const otherUser =
          receivedMessage.sender === username
            ? receivedMessage.receiver
            : receivedMessage.sender;
        this.addMessageToConversation(otherUser, receivedMessage);
      }
    );
  }

  private subscribeToGroupChat(username: string): void {
    this.stompClient?.subscribe(
      `/user/${username}/queue/group-messages`,
      (message) => {
        const receivedMessage = JSON.parse(message.body);
        console.log("Received group message:", receivedMessage); // Debug log
        this.addMessageToGroup(receivedMessage.groupId, receivedMessage);
        // Update messages BehaviorSubject if this is the current group
        const currentMessages =
          this.messagesByGroup.get(receivedMessage.groupId) || [];
        this.messages.next(currentMessages);
      }
    );
  }

  private addMessageToGroup(groupId: number, message: Message) {
    const currentMessages = this.messagesByGroup.get(groupId) || [];
    this.messagesByGroup.set(groupId, [...currentMessages, message]);
    this.messages.next(this.messagesByGroup.get(groupId) || []);
  }

  sendPrivateMessage(receiver: string, content: string): void {
    if (this.stompClient?.connected) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) return;

      const message: Message = {
        type: "CHAT",
        content: content,
        sender: currentUser.username,
        receiver: receiver,
        timestamp: new Date(),
      };

      // Send through WebSocket
      this.stompClient.publish({
        destination: "/app/chat.private",
        body: JSON.stringify(message),
      });
    }
  }

  sendGroupMessage(groupId: number, content: string): void {
    if (this.stompClient?.connected) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) return;

      const message: Message = {
        type: "GROUP_CHAT",
        content: content,
        sender: currentUser.username,
        groupId: groupId,
        timestamp: new Date(),
      };

      console.log("Sending group message:", message); // Debug log

      this.stompClient.publish({
        destination: "/app/chat.group",
        body: JSON.stringify(message),
      });

      // Optimistically add message to local storage
      // this.addMessageToGroup(groupId, message);
      // const currentMessages = this.messagesByGroup.get(groupId) || [];
      // this.messages.next(currentMessages);
    }
  }

  private addMessageToConversation(otherUser: string, message: Message) {
    const currentMessages = this.messagesByUser.get(otherUser) || [];
    this.messagesByUser.set(otherUser, [...currentMessages, message]);
    this.messages.next(this.messagesByUser.get(otherUser) || []);
  }

  async sendFile(file: File, receiver: string): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !this.stompClient?.connected) return;

    // First upload the file
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sender", currentUser.username);
    formData.append("receiver", receiver);

    try {
      const response = await this.http
        .post<{ fileUrl: string }>(`${this.API_URL}/chat/upload`, formData)
        .toPromise();

      // Then send message with file info
      const message: Message = {
        type: "FILE",
        content: response!.fileUrl,
        sender: currentUser.username,
        receiver: receiver,
        timestamp: new Date(),
        fileName: file.name,
        fileType: file.type,
      };

      this.stompClient.publish({
        destination: "/app/chat.private",
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error("Error sending file:", error);
    }
  }

  async sendAudioFile(file: File, receiver: string): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !this.stompClient?.connected) return;

    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("sender", currentUser.username);
      formData.append("receiver", receiver);

      this.http
        .post<ChatMessage>(`${this.API_URL}/chat/upload-audio`, formData)
        .toPromise()
        .then((message) => {
          this.stompClient?.publish({
            destination: "/app/chat.private",
            body: JSON.stringify(message),
          });
          resolve();
        })
        .catch((error) => {
          console.error("Error sending audio file:", error);
          reject(error);
        });
    });
  }

  getMessagesForUser(username: string): Message[] {
    return this.messagesByUser.get(username) || [];
  }

  onMessage(): Observable<Message[]> {
    return this.messages.asObservable();
  }

  getUserGroups(): Observable<Group[]> {
    const token = this.authService.getToken();
    if (!token) return of([]);
    const headers = new HttpHeaders().set("Authorization", `Bearer ${token}`);
    return this.http.get<Group[]>(`${this.API_URL}/groups`, { headers });
  }

  createGroup(
    name: string,
    description: string,
    members: string[]
  ): Observable<Group> {
    const token = this.authService.getToken();
    if (!token) throw new Error("No token available");

    const headers = new HttpHeaders().set("Authorization", `Bearer ${token}`);
    return this.http.post<Group>(
      `${this.API_URL}/groups`,
      {
        name,
        description,
        members,
      },
      { headers }
    );
  }

  async sendGroupFile(file: File, groupId: number): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !this.stompClient?.connected) return;

    // First upload the file
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sender", currentUser.username);
    formData.append("groupId", groupId.toString());

    try {
      const response = await this.http
        .post<{ fileUrl: string }>(
          `${this.API_URL}/chat/upload-group`,
          formData
        )
        .toPromise();

      // Then send message with file info
      const message: Message = {
        type: "FILE",
        content: response!.fileUrl,
        sender: currentUser.username,
        groupId: groupId,
        timestamp: new Date(),
        fileName: file.name,
        fileType: file.type,
      };

      this.stompClient.publish({
        destination: "/app/chat.group",
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error("Error sending file:", error);
    }
  }

  getContacts(): Observable<User[]> {
    const token = this.authService.getToken();
    if (!token) {
      return of([]);
    }

    const headers = new HttpHeaders().set("Authorization", `Bearer ${token}`);
    return this.http.get<User[]>(`${this.API_URL}/chatters`, { headers });
  }

  getMessagesForGroup(groupId: number): Message[] {
    console.log("Getting messages for group:", groupId); // Debug log
    console.log("Available messages:", this.messagesByGroup); // Debug log
    return this.messagesByGroup.get(groupId) || [];
  }

  disconnect(): void {
    if (this.stompClient?.connected) {
      this.stompClient.deactivate();
    }
    this.messagesByUser.clear();
    this.messagesByGroup.clear();
    this.messages.next([]);
    this.groupsSubject.next([]);
  }
}
