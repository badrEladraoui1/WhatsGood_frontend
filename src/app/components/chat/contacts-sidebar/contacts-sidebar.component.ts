import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { User } from "../../../models/user.model";
import { formatLastMessageTime } from "../../../utils/date.utils";

@Component({
  selector: "app-contacts-sidebar",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-80 bg-white border-l flex flex-col h-full">
      <div class="p-4 bg-[#708D81]">
        <button
          (click)="onNewGroup.emit()"
          class="w-full bg-white text-[#708D81] py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
        >
          <i class="fas fa-users"></i>
          Create New Group
        </button>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div
          *ngFor="let contact of contacts"
          (click)="onSelectContact.emit(contact)"
          class="p-4 hover:bg-gray-100 cursor-pointer transition-colors"
          [class.bg-gray-100]="selectedContactId === contact.id"
        >
          <div class="flex items-center">
            <div class="relative">
              <img
                [src]="
                  'http://localhost:8081/api/users/profile-picture/' +
                  contact.username
                "
                class="w-12 h-12 rounded-full object-cover border border-gray-200"
                alt="{{ contact.username }}'s avatar"
                (error)="onImageError($event)"
              />
              <div
                class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                [class.bg-green-500]="contact.isOnline"
                [class.bg-gray-400]="!contact.isOnline"
              ></div>
            </div>
            <div class="ml-3 flex-1">
              <div class="flex justify-between items-start">
                <span class="font-medium text-gray-900">{{
                  contact.username
                }}</span>
                <span class="text-xs text-gray-500">
                  {{
                    contact.lastMessageTime
                      ? formatTime(contact.lastMessageTime)
                      : ""
                  }}
                </span>
              </div>
              <p class="text-sm text-gray-500 truncate">
                {{ contact.lastMessage || "No messages yet" }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ContactsSidebarComponent {
  @Input() contacts: User[] = [];
  @Input() selectedContactId?: number;
  @Output() onSelectContact = new EventEmitter<User>();
  @Output() onNewGroup = new EventEmitter<void>();

  formatTime(date?: Date) {
    return date ? formatLastMessageTime(date) : "";
  }

  onImageError(event: any) {
    event.target.src = "assets/default-avatar.png";
  }
}
