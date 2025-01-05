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
  template: `
    <div
      #messageContainer
      class="h-full overflow-y-auto p-4 bg-[#F4D58D] bg-opacity-10 relative"
    >
      <!-- No messages placeholder -->
      <div
        *ngIf="messages.length === 0"
        class="flex items-center justify-center h-full text-gray-500"
      >
        No messages yet. Start a conversation!
      </div>

      <!-- Messages container -->
      <div *ngFor="let message of messages; let i = index">
        <!-- Date separator -->
        <div
          *ngIf="shouldShowDateSeparator(message, i)"
          class="text-center my-4 text-sm text-gray-500"
        >
          {{ message.timestamp | date : "mediumDate" }}
        </div>

        <!-- Message container -->
        <div
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
              [src]="getProfilePicture(message.sender)"
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

            <!-- Message content container -->
            <div
              [class]="
                message.sender === currentUser?.username
                  ? 'bg-[#708D81] text-white rounded-l-lg rounded-tr-lg'
                  : 'bg-white text-[#001427] rounded-r-lg rounded-tl-lg'
              "
              class="p-3 shadow-sm"
            >
              <!-- Message content based on type -->
              <ng-container [ngSwitch]="message.type">
                <!-- Text Message -->
                <p
                  *ngSwitchCase="'CHAT'"
                  class="break-words whitespace-pre-wrap"
                >
                  {{ message.content }}
                </p>

                <!-- File Message -->
                <ng-container *ngSwitchCase="'FILE'">
                  <!-- Image File -->
                  <div *ngIf="isImageFile(message)" class="mb-2">
                    <img
                      [src]="message.content"
                      class="max-w-full max-h-64 object-contain rounded-lg cursor-pointer"
                      (click)="openFullImage(message)"
                      alt="Uploaded image"
                    />
                    <p class="text-xs mt-1 truncate">{{ message.fileName }}</p>
                  </div>

                  <!-- Video File -->
                  <div *ngIf="isVideoFile(message)" class="mb-2">
                    <video controls class="max-w-full max-h-64 rounded-lg">
                      <source
                        [src]="message.content"
                        [type]="message.fileType"
                      />
                      Your browser does not support the video tag.
                    </video>
                    <p class="text-xs mt-1 truncate">{{ message.fileName }}</p>
                  </div>

                  <!-- Other File Types -->
                  <div
                    *ngIf="!isImageFile(message) && !isVideoFile(message)"
                    class="flex items-center"
                  >
                    <i class="fas fa-file mr-2"></i>
                    <a
                      [href]="message.content"
                      download
                      class="underline truncate max-w-full block"
                    >
                      {{ message.fileName }}
                    </a>
                  </div>
                </ng-container>
              </ng-container>

              <!-- Timestamp -->
              <span class="text-xs opacity-75 block mt-1 text-right">
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
              [src]="getProfilePicture(currentUser?.username)"
              class="w-8 h-8 rounded-full object-cover"
              [alt]="currentUser?.username"
              (error)="onImageError($event)"
            />
          </div>
        </div>
      </div>

      <!-- Scroll to bottom button -->
      <button
        *ngIf="showScrollButton"
        (click)="scrollToBottom()"
        class="fixed bottom-20 right-4 bg-[#708D81] text-white 
               rounded-full p-2 shadow-lg hover:bg-[#5a7267] 
               transition-colors z-10"
      >
        <i class="fas fa-arrow-down"></i>
      </button>
    </div>
  `,
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

// @Component({
//   selector: "app-message-list",
//   standalone: true,
//   imports: [CommonModule, SafePipe],
//   template: `
//     <div
//       #messageContainer
//       class="h-full overflow-y-auto p-4 bg-[#F4D58D] bg-opacity-10 relative"
//     >
//       <!-- No messages placeholder -->
//       <div
//         *ngIf="messages.length === 0"
//         class="flex items-center justify-center h-full text-gray-500"
//       >
//         No messages yet. Start a conversation!
//       </div>

//       <!-- Messages container -->
//       <div *ngFor="let message of messages; let i = index">
//         <!-- Date separator -->
//         <div
//           *ngIf="shouldShowDateSeparator(message, i)"
//           class="text-center my-4 text-sm text-gray-500"
//         >
//           {{ message.timestamp | date : "mediumDate" }}
//         </div>

//         <!-- Message container -->
//         <div
//           [class]="
//             message.sender === currentUser?.username
//               ? 'flex justify-end mb-4 items-end'
//               : 'flex justify-start mb-4 items-end'
//           "
//         >
//           <!-- Other user's profile picture -->
//           <div
//             *ngIf="message.sender !== currentUser?.username"
//             class="flex-shrink-0 mr-2"
//           >
//             <img
//               [src]="getProfilePicture(message.sender)"
//               class="w-8 h-8 rounded-full object-cover"
//               [alt]="message.sender"
//               (error)="onImageError($event)"
//             />
//           </div>

//           <div class="flex flex-col max-w-[70%]">
//             <!-- Sender name for other users' messages -->
//             <span
//               *ngIf="message.sender !== currentUser?.username"
//               class="text-xs text-gray-500 mb-1 ml-1"
//             >
//               {{ message.sender }}
//             </span>

//             <!-- Message content container -->
//             <div
//               [class]="
//                 message.sender === currentUser?.username
//                   ? 'bg-[#708D81] text-white rounded-l-lg rounded-tr-lg'
//                   : 'bg-white text-[#001427] rounded-r-lg rounded-tl-lg'
//               "
//               class="p-3 shadow-sm"
//             >
//               <!-- Message content based on type -->
//               <ng-container [ngSwitch]="message.type">
//                 <!-- Text Message -->
//                 <p
//                   *ngSwitchCase="'CHAT'"
//                   class="break-words whitespace-pre-wrap"
//                 >
//                   {{ message.content }}
//                 </p>

//                 <!-- File Message -->
//                 <ng-container *ngSwitchCase="'FILE'">
//                   <!-- Image File -->
//                   <div *ngIf="isImageFile(message)" class="mb-2">
//                     <img
//                       [src]="renderFileContent(message)"
//                       class="max-w-full max-h-64 object-contain rounded-lg cursor-pointer"
//                       (click)="openFullImage(message)"
//                       alt="Uploaded image"
//                     />
//                     <p class="text-xs mt-1 truncate">{{ message.fileName }}</p>
//                   </div>

//                   <!-- Video File -->
//                   <div *ngIf="isVideoFile(message)" class="mb-2">
//                     <video controls class="max-w-full max-h-64 rounded-lg">
//                       <source
//                         [src]="renderFileContent(message)"
//                         [type]="message.fileType"
//                       />
//                       Your browser does not support the video tag.
//                     </video>
//                     <p class="text-xs mt-1 truncate">{{ message.fileName }}</p>
//                   </div>

//                   <!-- Other File Types -->
//                   <div
//                     *ngIf="!isImageFile(message) && !isVideoFile(message)"
//                     class="flex items-center"
//                   >
//                     <i class="fas fa-file mr-2"></i>
//                     <a
//                       [href]="renderFileContent(message)"
//                       download
//                       class="underline truncate max-w-full block"
//                     >
//                       {{ message.fileName }}
//                     </a>
//                   </div>
//                 </ng-container>
//               </ng-container>

//               <!-- Timestamp -->
//               <span class="text-xs opacity-75 block mt-1 text-right">
//                 {{ message.timestamp | date : "shortTime" }}
//               </span>
//             </div>
//           </div>

//           <!-- Current user's profile picture -->
//           <div
//             *ngIf="message.sender === currentUser?.username"
//             class="flex-shrink-0 ml-2"
//           >
//             <img
//               [src]="getProfilePicture(currentUser?.username)"
//               class="w-8 h-8 rounded-full object-cover"
//               [alt]="currentUser?.username"
//               (error)="onImageError($event)"
//             />
//           </div>
//         </div>
//       </div>

//       <!-- Scroll to bottom button -->
//       <button
//         *ngIf="showScrollButton"
//         (click)="scrollToBottom()"
//         class="fixed bottom-20 right-4 bg-[#708D81] text-white
//                rounded-full p-2 shadow-lg hover:bg-[#5a7267]
//                transition-colors z-10"
//       >
//         <i class="fas fa-arrow-down"></i>
//       </button>
//     </div>
//   `,
// })
// export class MessageListComponent implements AfterViewChecked, OnDestroy {
//   @Input() messages: Message[] = [];
//   @Input() currentUser?: User | null = null;
//   @ViewChild("messageContainer") private messageContainer!: ElementRef;

//   showScrollButton = false;
//   private autoScroll = true;

//   constructor(private sanitizer: DomSanitizer) {}

//   ngAfterViewChecked() {
//     if (this.autoScroll) {
//       this.scrollToBottom();
//     }
//   }

//   scrollToBottom(): void {
//     try {
//       if (this.messageContainer) {
//         const container = this.messageContainer.nativeElement;
//         container.scrollTop = container.scrollHeight;
//       }
//     } catch (err) {
//       console.error("Scroll to bottom failed", err);
//     }
//   }

//   renderFileContent(message: Message): string {
//     if (message.type === "FILE" && message.content) {
//       return `data:${message.fileType};base64,${message.content}`;
//     }
//     return "";
//   }

//   isImageFile(message: Message): boolean {
//     return (
//       message.type === "FILE" && message.fileType?.startsWith("image/") === true
//     );
//   }

//   isVideoFile(message: Message): boolean {
//     return (
//       message.type === "FILE" && message.fileType?.startsWith("video/") === true
//     );
//   }

//   openFullImage(message: Message) {
//     const fullImageUrl = this.renderFileContent(message);
//     window.open(fullImageUrl, "_blank");
//   }

//   onImageError(event: any) {
//     event.target.src = "assets/default-avatar.png";
//   }

//   getProfilePicture(username?: string): string {
//     return username
//       ? `http://localhost:8081/api/users/profile-picture/${username}`
//       : "assets/default-avatar.png";
//   }

//   shouldShowDateSeparator(message: Message, index: number): boolean {
//     if (index === 0) return true;

//     const currentDate = new Date(message.timestamp).toDateString();
//     const previousDate = new Date(
//       this.messages[index - 1].timestamp
//     ).toDateString();

//     return currentDate !== previousDate;
//   }

//   ngOnDestroy() {
//     // Any cleanup if needed
//   }
// }

// import {
//   AfterViewInit,
//   Component,
//   ElementRef,
//   Input,
//   OnDestroy,
//   ViewChild,
// } from "@angular/core";
// import { CommonModule } from "@angular/common";
// import { Message } from "../../../models/message.model";
// import { User } from "../../../models/user.model";

// @Component({
//   selector: "app-message-list",
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div
//       #messageContainer
//       class="h-full overflow-y-auto p-4 bg-[#F4D58D] bg-opacity-10"
//     >
//       <div
//         *ngFor="let message of messages"
//         [class]="
//           message.sender === currentUser?.username
//             ? 'flex justify-end mb-4 items-end'
//             : 'flex justify-start mb-4 items-end'
//         "
//       >
//         <!-- Other user's profile picture -->
//         <div
//           *ngIf="message.sender !== currentUser?.username"
//           class="flex-shrink-0 mr-2"
//         >
//           <img
//             [src]="
//               'http://localhost:8081/api/users/profile-picture/' +
//               message.sender
//             "
//             class="w-8 h-8 rounded-full object-cover"
//             [alt]="message.sender"
//             (error)="onImageError($event)"
//           />
//         </div>

//         <div class="flex flex-col max-w-[70%]">
//           <!-- Sender name for other users' messages -->
//           <span
//             *ngIf="message.sender !== currentUser?.username"
//             class="text-xs text-gray-500 mb-1 ml-1"
//           >
//             {{ message.sender }}
//           </span>

//           <div
//             [class]="
//               message.sender === currentUser?.username
//                 ? 'bg-[#708D81] text-white rounded-l-lg rounded-tr-lg'
//                 : 'bg-white text-[#001427] rounded-r-lg rounded-tl-lg'
//             "
//             class="p-3 shadow-sm"
//           >
//             <p class="break-words">{{ message.content }}</p>
//             <span class="text-xs opacity-75 block mt-1">
//               {{ message.timestamp | date : "shortTime" }}
//             </span>
//           </div>
//         </div>

//         <!-- Current user's profile picture -->
//         <div
//           *ngIf="message.sender === currentUser?.username"
//           class="flex-shrink-0 ml-2"
//         >
//           <img
//             [src]="
//               'http://localhost:8081/api/users/profile-picture/' +
//               currentUser?.username
//             "
//             class="w-8 h-8 rounded-full object-cover"
//             [alt]="currentUser?.username"
//             (error)="onImageError($event)"
//           />
//         </div>
//       </div>

//       <!-- Scroll to bottom button -->
//       <button
//         *ngIf="showScrollButton"
//         (click)="scrollToBottom()"
//         class="fixed bottom-20 right-4 bg-[#708D81] text-white rounded-full p-2 shadow-lg hover:bg-[#5a7267] transition-colors"
//       >
//         <i class="fas fa-arrow-down"></i>
//       </button>
//     </div>
//   `,
// })
// export class MessageListComponent implements AfterViewInit, OnDestroy {
//   @Input() messages: Message[] = [];
//   @Input() currentUser?: User | null = null;
//   @ViewChild("messageContainer") private messageContainer!: ElementRef;

//   showScrollButton = false;
//   private autoScroll = true;
//   private scrollInterval: any;

//   ngAfterViewInit() {
//     // Start checking scroll position after view is initialized
//     this.scrollInterval = setInterval(() => this.checkScroll(), 200);
//     this.scrollToBottom();
//   }

//   private checkScroll() {
//     if (this.messageContainer) {
//       const element = this.messageContainer.nativeElement;
//       const atBottom =
//         element.scrollHeight - element.scrollTop === element.clientHeight;
//       this.showScrollButton = !atBottom;
//       this.autoScroll = atBottom;
//     }
//   }

//   scrollToBottom(): void {
//     try {
//       if (this.messageContainer) {
//         this.messageContainer.nativeElement.scrollTop =
//           this.messageContainer.nativeElement.scrollHeight;
//         this.autoScroll = true;
//       }
//     } catch (err) {}
//   }

//   onImageError(event: any) {
//     event.target.src = "assets/default-avatar.png";
//   }

//   ngOnDestroy() {
//     if (this.scrollInterval) {
//       clearInterval(this.scrollInterval);
//     }
//   }
// }
