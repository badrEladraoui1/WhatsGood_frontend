import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Message } from "../../../models/message.model";
import { User } from "../../../models/user.model";

@Component({
  selector: "app-message-list",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      #messageContainer
      class="h-full overflow-y-auto p-4 bg-[#F4D58D] bg-opacity-10"
    >
      <div
        *ngFor="let message of messages"
        [class]="
          message.sender === currentUser?.username
            ? 'flex justify-end mb-4 items-end'
            : 'flex justify-start mb-4 items-end'
        "
      >
        <!-- Other user's profile picture -->
        <div
          *ngIf="message.sender !== currentUser?.username"
          class="flex-shrink-0 mr-2"
        >
          <img
            [src]="
              'http://localhost:8081/api/users/profile-picture/' +
              message.sender
            "
            class="w-8 h-8 rounded-full object-cover"
            [alt]="message.sender"
            (error)="onImageError($event)"
          />
        </div>

        <div class="flex flex-col max-w-[70%]">
          <!-- Sender name for other users' messages -->
          <span
            *ngIf="message.sender !== currentUser?.username"
            class="text-xs text-gray-500 mb-1 ml-1"
          >
            {{ message.sender }}
          </span>

          <div
            [class]="
              message.sender === currentUser?.username
                ? 'bg-[#708D81] text-white rounded-l-lg rounded-tr-lg'
                : 'bg-white text-[#001427] rounded-r-lg rounded-tl-lg'
            "
            class="p-3 shadow-sm"
          >
            <p class="break-words">{{ message.content }}</p>
            <span class="text-xs opacity-75 block mt-1">
              {{ message.timestamp | date : "shortTime" }}
            </span>
          </div>
        </div>

        <!-- Current user's profile picture -->
        <div
          *ngIf="message.sender === currentUser?.username"
          class="flex-shrink-0 ml-2"
        >
          <img
            [src]="
              'http://localhost:8081/api/users/profile-picture/' +
              currentUser?.username
            "
            class="w-8 h-8 rounded-full object-cover"
            [alt]="currentUser?.username"
            (error)="onImageError($event)"
          />
        </div>
      </div>

      <!-- Scroll to bottom button -->
      <button
        *ngIf="showScrollButton"
        (click)="scrollToBottom()"
        class="fixed bottom-20 right-4 bg-[#708D81] text-white rounded-full p-2 shadow-lg hover:bg-[#5a7267] transition-colors"
      >
        <i class="fas fa-arrow-down"></i>
      </button>
    </div>
  `,
})
export class MessageListComponent implements AfterViewInit, OnDestroy {
  @Input() messages: Message[] = [];
  @Input() currentUser?: User | null = null;
  @ViewChild("messageContainer") private messageContainer!: ElementRef;

  showScrollButton = false;
  private autoScroll = true;
  private scrollInterval: any;

  ngAfterViewInit() {
    // Start checking scroll position after view is initialized
    this.scrollInterval = setInterval(() => this.checkScroll(), 200);
    this.scrollToBottom();
  }

  private checkScroll() {
    if (this.messageContainer) {
      const element = this.messageContainer.nativeElement;
      const atBottom =
        element.scrollHeight - element.scrollTop === element.clientHeight;
      this.showScrollButton = !atBottom;
      this.autoScroll = atBottom;
    }
  }

  scrollToBottom(): void {
    try {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
        this.autoScroll = true;
      }
    } catch (err) {}
  }

  onImageError(event: any) {
    event.target.src = "assets/default-avatar.png";
  }

  ngOnDestroy() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
  }
}
