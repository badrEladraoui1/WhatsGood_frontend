import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  Pipe,
  PipeTransform,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

import { Message } from "../../../models/message.model";
import { User } from "../../../models/user.model";

@Pipe({
  name: "safe",
  standalone: true,
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: "app-message-list",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./message-list.component.html",
})
export class MessageListComponent implements AfterViewChecked, OnDestroy {
  @Input() messages: Message[] = [];
  @Input() currentUser?: User | null = null;
  @ViewChild("messageContainer") private messageContainer!: ElementRef;

  showScrollButton = false;
  private autoScroll = true;

  constructor(private sanitizer: DomSanitizer) {}

  ngAfterViewChecked() {
    if (this.autoScroll) {
      this.scrollToBottom();
    }
  }

  scrollToBottom(): void {
    try {
      if (this.messageContainer) {
        const container = this.messageContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      console.error("Scroll to bottom failed", err);
    }
  }

  isImageFile(message: Message): boolean {
    return (
      message.type === "FILE" && message.fileType?.startsWith("image/") === true
    );
  }

  isVideoFile(message: Message): boolean {
    return (
      message.type === "FILE" && message.fileType?.startsWith("video/") === true
    );
  }

  openFullImage(message: Message) {
    window.open(message.content, "_blank");
  }

  onImageError(event: any) {
    event.target.src = "assets/default-avatar.png";
  }

  getProfilePicture(username?: string): string {
    return username
      ? `http://localhost:8081/api/users/profile-picture/${username}`
      : "assets/default-avatar.png";
  }

  shouldShowDateSeparator(message: Message, index: number): boolean {
    if (index === 0) return true;

    const currentDate = new Date(message.timestamp).toDateString();
    const previousDate = new Date(
      this.messages[index - 1].timestamp
    ).toDateString();

    return currentDate !== previousDate;
  }

  ngOnDestroy() {
    // Any cleanup if needed
  }
}
