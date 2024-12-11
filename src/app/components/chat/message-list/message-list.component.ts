import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Message } from "../../../models/message.model";
import { User } from "../../../models/user.model";

@Component({
  selector: "app-message-list",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full overflow-y-auto p-4 bg-[#F4D58D] bg-opacity-10">
      <div
        *ngFor="let message of messages"
        [class]="
          message.sender === currentUser?.username
            ? 'flex justify-end mb-4'
            : 'flex justify-start mb-4'
        "
      >
        <div
          [class]="
            message.sender === currentUser?.username
              ? 'bg-[#708D81] text-white'
              : 'bg-white text-[#001427]' +
                ' rounded-lg p-3 max-w-[70%] shadow-sm'
          "
        >
          <p>{{ message.content }}</p>
          <span class="text-xs opacity-75 block mt-1">
            {{ message.timestamp | date : "shortTime" }}
          </span>
        </div>
      </div>
    </div>
  `,
})
export class MessageListComponent {
  @Input() messages: Message[] = [];
  @Input() currentUser?: User | null = null;
}
