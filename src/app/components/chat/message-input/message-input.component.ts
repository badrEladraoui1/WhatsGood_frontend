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
        <input
          #fileInput
          type="file"
          class="hidden"
          (change)="onFileSelected($event)"
        />
        <button
          (click)="fileInput.click()"
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
      <div class="mt-2 flex justify-end">
        <!-- <button
          (click)="sendAudioFile()"
          class="p-2 bg-[#708D81] text-white rounded-full hover:bg-[#5a7267] transition-colors"
        >
          <i class="fas fa-microphone"></i> Send Audio
        </button> -->
      </div>
    </div>
  `,
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

// import { Component, EventEmitter, Output } from "@angular/core";
// import { CommonModule } from "@angular/common";
// import { FormControl, ReactiveFormsModule } from "@angular/forms";

// @Component({
//   selector: "app-message-input",
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   template: `
//     <div class="bg-white border-t border-gray-200 p-4">
//       <div class="flex items-center max-w-[100%] mx-auto">
//         <input
//           #fileInput
//           type="file"
//           class="hidden"
//           (change)="onFileSelected($event)"
//         />
//         <button
//           (click)="fileInput.click()"
//           class="p-2 text-[#708D81] hover:text-[#5a7267] transition-colors"
//         >
//           <i class="fas fa-paperclip"></i>
//         </button>
//         <input
//           [formControl]="messageInput"
//           class="flex-1 mx-4 p-2 border rounded-full focus:outline-none focus:border-[#708D81]"
//           placeholder="Type a message"
//           (keyup.enter)="sendMessage()"
//         />
//         <button
//           (click)="sendMessage()"
//           [disabled]="!messageInput.value?.trim()"
//           class="p-2 bg-[#708D81] text-white rounded-full hover:bg-[#5a7267] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <i class="fas fa-paper-plane"></i>
//         </button>
//       </div>
//     </div>
//   `,
// })
// export class MessageInputComponent {
//   @Output() onSend = new EventEmitter<string>();
//   @Output() onFile = new EventEmitter<File>();
//   @Output() onAudioFile = new EventEmitter<File>();

//   onFileSelected(event: any) {
//     const file: File = event.target.files[0];
//     if (file) {
//       if (file.type.startsWith("audio/")) {
//         this.onAudioFile.emit(file);
//       } else {
//         this.onFile.emit(file);
//       }
//       event.target.value = ""; // Reset input
//     }
//   }

//   messageInput = new FormControl("");

//   sendMessage(): void {
//     if (this.messageInput.value?.trim()) {
//       this.onSend.emit(this.messageInput.value);
//       this.messageInput.reset();
//     }
//   }

//   // onFileSelected(event: any) {
//   //   const file: File = event.target.files[0];
//   //   if (file) {
//   //     this.onFile.emit(file);
//   //     event.target.value = ""; // Reset input
//   //   }
//   // }
// }
