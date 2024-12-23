import { Component, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: "app-message-input",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white border-t border-gray-200 p-4">
      <div class="flex items-center max-w-[100%] mx-auto">
        <button
          (click)="onAttachment.emit()"
          class="p-2 text-[#708D81] hover:text-[#5a7267] transition-colors"
        >
          <i class="fas fa-paperclip"></i>
        </button>
        <input
          [formControl]="messageInput"
          class="flex-1 mx-4 p-2 border rounded-full focus:outline-none focus:border-[#708D81]"
          placeholder="Type a message"
          (keyup.enter)="sendMessage()"
        />
        <button
          (click)="sendMessage()"
          [disabled]="!messageInput.value?.trim()"
          class="p-2 bg-[#708D81] text-white rounded-full hover:bg-[#5a7267] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  `,
})
export class MessageInputComponent {
  @Output() onSend = new EventEmitter<string>();
  @Output() onAttachment = new EventEmitter<void>();

  messageInput = new FormControl("");

  sendMessage(): void {
    if (this.messageInput.value?.trim()) {
      this.onSend.emit(this.messageInput.value);
      this.messageInput.reset();
    }
  }
}
