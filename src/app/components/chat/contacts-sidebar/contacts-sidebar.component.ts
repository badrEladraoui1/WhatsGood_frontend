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
      <!-- ... rest of the header ... -->
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
                [src]="contact.profilePicture || 'assets/default-avatar.png'"
                class="w-12 h-12 rounded-full object-cover"
                alt="{{ contact.username }}'s avatar"
              />
              <div
                class="absolute bottom-0 right-0 w-3 h-3 rounded-full"
                [class.bg-green-500]="contact.isOnline"
                [class.bg-gray-400]="!contact.isOnline"
              ></div>
            </div>
            <!-- ... rest of the contact info ... -->
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ContactsSidebarComponent {
  @Input() contacts: User[] = [];
  @Input() selectedContactId?: number; // Changed to number
  @Output() onSelectContact = new EventEmitter<User>();
  @Output() onNewGroup = new EventEmitter<void>();

  formatTime(date?: Date) {
    return date ? formatLastMessageTime(date) : "";
  }
}
