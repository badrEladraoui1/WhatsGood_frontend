import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChatService } from "../../services/chat.service";
import { User } from "../../models/user.model";
import { Message } from "../../models/message.model";
import { ContactsSidebarComponent } from "./contacts-sidebar/contacts-sidebar.component";
import { ChatHeaderComponent } from "./chat-header/chat-header.component";
import { MessageListComponent } from "./message-list/message-list.component";
import { MessageInputComponent } from "./message-input/message-input.component";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-chat",
  standalone: true,
  imports: [
    CommonModule,
    ContactsSidebarComponent,
    ChatHeaderComponent,
    MessageListComponent,
    MessageInputComponent,
  ],
  template: `
    <div class="h-[calc(100vh-4rem)] flex bg-[#001427]">
      <div class="flex-1 flex flex-col">
        <app-chat-header [contact]="selectedContact"></app-chat-header>

        <div class="flex-1 relative">
          <app-message-list
            [messages]="messages"
            [currentUser]="currentUser"
            class="absolute inset-0"
          >
          </app-message-list>
        </div>

        <div class="mt-auto">
          <app-message-input
            (onSend)="sendMessage($event)"
            (onAttachment)="handleAttachment()"
          >
          </app-message-input>
        </div>
      </div>

      <app-contacts-sidebar
        [contacts]="contacts"
        [selectedContactId]="selectedContact?.id"
        (onSelectContact)="selectContact($event)"
        (onNewGroup)="openNewGroupModal()"
      >
      </app-contacts-sidebar>
    </div>
  `,
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  contacts: User[] = [];
  selectedContact: User | null = null;
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((authResponse) => {
      if (authResponse) {
        this.currentUser = {
          id: authResponse.id,
          username: authResponse.username,
          profilePicture: authResponse.profilePicture,
          isOnline: true,
        };
        this.loadContacts();
        this.initializeWebSocket();
      }
    });
  }

  private initializeWebSocket(): void {
    if (this.currentUser) {
      this.chatService.connect(this.currentUser.username);

      this.chatService.onMessage().subscribe((message) => {
        this.messages.push(message);
      });

      this.chatService
        .onUserStatusChange()
        .subscribe(({ username, isOnline }) => {
          const contact = this.contacts.find((c) => c.username === username);
          if (contact) {
            contact.isOnline = isOnline;
          }
        });
    }
  }

  loadContacts(): void {
    this.chatService.getContacts().subscribe((contacts) => {
      this.contacts = contacts;
      if (contacts.length > 0 && !this.selectedContact) {
        this.selectContact(contacts[0]);
      }
    });
  }

  loadMessages(): void {
    if (this.selectedContact && this.currentUser) {
      this.chatService
        .getMessageHistory(this.selectedContact.username)
        .subscribe((messages) => {
          this.messages = messages;
        });
    }
  }

  selectContact(contact: User): void {
    this.selectedContact = contact;
    this.loadMessages();
  }

  sendMessage(content: string): void {
    if (content && this.selectedContact && this.currentUser) {
      const message: Message = {
        type: "CHAT",
        content,
        sender: this.currentUser.username,
        receiver: this.selectedContact.username,
        timestamp: new Date(),
      };

      this.chatService.sendMessage(message);
    }
  }

  handleAttachment(): void {
    console.log("Attachment handling not implemented yet");
  }

  openNewGroupModal(): void {
    console.log("Group creation not implemented yet");
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
  }
}
