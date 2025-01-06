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
import { Group } from "../../models/groupe.model";

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
  templateUrl: "./chat.component.html",
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  contacts: User[] = [];
  groups: Group[] = [];
  selectedContact: User | null = null;
  currentUser: User | null = null;
  selectedGroup: Group | null = null;

  constructor(
    private authService: AuthService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    // Single subscription to handle auth and messages
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
        this.loadGroups();
      }
    });
  }

  private initializeWebSocket(): void {
    if (this.currentUser) {
      this.chatService.connect(this.currentUser.username);

      this.chatService.onMessage().subscribe((messages) => {
        if (this.selectedContact) {
          this.messages = this.chatService.getMessagesForUser(
            this.selectedContact.username
          );
        } else if (this.selectedGroup) {
          this.messages = this.chatService.getMessagesForGroup(
            this.selectedGroup.id
          );
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

  loadGroups(): void {
    this.chatService.getUserGroups().subscribe((groups) => {
      this.groups = groups;
    });
  }

  selectContact(contact: User): void {
    this.selectedContact = contact;
    if (contact) {
      // Load existing messages for this contact
      this.messages = this.chatService.getMessagesForUser(contact.username);
    }
  }

  sendMessage(content: string): void {
    if (!content) return;
    if (this.selectedContact) {
      this.chatService.sendPrivateMessage(
        this.selectedContact.username,
        content
      );
    } else if (this.selectedGroup) {
      console.log("Sending group message to:", this.selectedGroup.id);
      this.chatService.sendGroupMessage(this.selectedGroup.id, content);
    }
  }

  selectGroup(group: Group): void {
    this.selectedGroup = group;
    this.selectedContact = null;
    if (group) {
      this.messages = this.chatService.getMessagesForGroup(group.id);
    }
  }

  // handleAttachment(file: File): void {
  //   if (this.selectedContact) {
  //     if (file.type.startsWith("audio/")) {
  //       this.chatService.sendAudioFile(file, this.selectedContact.username);
  //     } else {
  //       this.chatService.sendFile(file, this.selectedContact.username);
  //     }
  //   } else if (this.selectedGroup) {
  //     if (file.type.startsWith("audio/")) {
  //       this.chatService.sendAudioFile(file, this.selectedGroup.id.toString());
  //     } else {
  //       this.chatService.sendFile(file, this.selectedGroup.id.toString());
  //     }
  //   }
  // }

  async handleAttachment(file: File): Promise<void> {
    try {
      if (this.selectedContact) {
        await this.chatService.sendFile(file, this.selectedContact.username);
      } else if (this.selectedGroup) {
        console.log("Sending file to group:", this.selectedGroup.id); // Debug log
        await this.chatService.sendGroupFile(file, this.selectedGroup.id);
      }
    } catch (error) {
      console.error("Error handling attachment:", error);
      // You might want to show an error message to the user here
    }
  }

  createGroup(groupData: {
    name: string;
    description: string;
    members: string[];
  }): void {
    console.log("Chat component creating group:", groupData); // Add logging

    this.chatService
      .createGroup(groupData.name, groupData.description, groupData.members)
      .subscribe(
        (newGroup) => {
          this.groups = [...this.groups, newGroup];
          this.selectGroup(newGroup);
        },
        (error) => {
          console.error("Error creating group:", error);
        }
      );
  }

  handleAudioFile(file: File): void {
    if (this.selectedContact) {
      this.chatService.sendAudioFile(file, this.selectedContact.username);
    }
  }

  openNewGroupModal(): void {
    console.log("Group creation not implemented yet");
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
  }
}
