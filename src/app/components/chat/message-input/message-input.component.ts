import { Component, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: "app-message-input",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./message-input.component.html",
})
export class MessageInputComponent {
  @Output() onSend = new EventEmitter<string>();
  @Output() onFile = new EventEmitter<File>();
  @Output() onAudioFile = new EventEmitter<File>();

  audioFile: File | null = null;

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.type.startsWith("audio/")) {
        this.audioFile = file;
      } else {
        this.onFile.emit(file);
      }
      event.target.value = ""; // Reset input
    }
  }

  sendAudioFile(): void {
    if (this.audioFile) {
      this.onAudioFile.emit(this.audioFile);
      this.audioFile = null;
    }
  }

  messageInput = new FormControl("");

  sendMessage(): void {
    if (this.messageInput.value?.trim()) {
      this.onSend.emit(this.messageInput.value);
      this.messageInput.reset();
    }
  }
}
