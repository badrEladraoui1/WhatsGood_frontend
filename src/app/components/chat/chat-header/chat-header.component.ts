import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Group } from "../../../models/groupe.model";
import { User } from "../../../models/user.model";

@Component({
  selector: "app-chat-header",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white border-b border-gray-200 p-4">
      <div class="flex items-center">
        <!-- Profile picture -->
        <div class="relative">
          <ng-container *ngIf="contact">
            <img
              [src]="
                'http://localhost:8081/api/users/profile-picture/' +
                contact.username
              "
              class="w-12 h-12 rounded-full object-cover"
              [alt]="contact.username"
              (error)="onImageError($event)"
            />
            <div
              class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
              [class.bg-green-500]="contact.isOnline"
              [class.bg-gray-400]="!contact.isOnline"
            ></div>
          </ng-container>
          <ng-container *ngIf="group">
            <div
              class="w-12 h-12 rounded-full bg-[#708D81] flex items-center justify-center text-white text-xl"
            >
              {{ group.name.charAt(0).toUpperCase() }}
            </div>
          </ng-container>
        </div>

        <!-- Name and status -->
        <div class="ml-4">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ contact?.username || group?.name }}
          </h2>
          <p class="text-sm text-gray-500">
            <ng-container *ngIf="contact">
              {{ contact.isOnline ? "Online" : "Offline" }}
            </ng-container>
            <ng-container *ngIf="group">
              {{ group.members.length || 0 }} members
            </ng-container>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class ChatHeaderComponent {
  @Input() contact: User | null = null;
  @Input() group: Group | null = null;

  onImageError(event: any) {
    event.target.src = "assets/default-avatar.png";
  }
}

// import { Component, Input } from "@angular/core";
// import { CommonModule } from "@angular/common";
// import { User } from "../../../models/user.model";
// import { Group } from "../../../models/groupe.model";

// @Component({
//   selector: "app-chat-header",
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="bg-[#708D81] p-4 flex items-center justify-between">
//       <div class="flex items-center" *ngIf="contact">
//         <div class="relative">
//           <img
//             [src]="
//               'http://localhost:8081/api/users/profile-picture/' +
//               contact.username
//             "
//             class="w-10 h-10 rounded-full object-cover"
//             alt="{{ contact.username }}'s avatar"
//           />
//           <div
//             class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
//             [class.bg-green-500]="contact.isOnline"
//             [class.bg-gray-400]="!contact.isOnline"
//           ></div>
//         </div>
//         <span class="ml-3 text-white font-medium">{{ contact.username }}</span>
//       </div>
//     </div>
//   `,
// })
// export class ChatHeaderComponent {
//   @Input() contact: User | null = null;
//   @Input() group: Group | null = null;

//   onImageError(event: any) {
//     event.target.src = "assets/default-avatar.png";
//   }
// }
