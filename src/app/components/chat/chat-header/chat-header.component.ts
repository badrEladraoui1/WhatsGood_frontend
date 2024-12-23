import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { User } from "../../../models/user.model";

@Component({
  selector: "app-chat-header",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-[#708D81] p-4 flex items-center justify-between">
      <div class="flex items-center" *ngIf="contact">
        <div class="relative">
          <img
            [src]="
              'http://localhost:8081/api/users/profile-picture/' +
              contact.username
            "
            class="w-10 h-10 rounded-full object-cover"
            alt="{{ contact.username }}'s avatar"
          />
          <div
            class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
            [class.bg-green-500]="contact.isOnline"
            [class.bg-gray-400]="!contact.isOnline"
          ></div>
        </div>
        <span class="ml-3 text-white font-medium">{{ contact.username }}</span>
      </div>
    </div>
  `,
})
export class ChatHeaderComponent {
  @Input() contact: User | null = null;
}
