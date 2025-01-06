import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Group } from "../../../models/groupe.model";
import { User } from "../../../models/user.model";

@Component({
  selector: "app-chat-header",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./chat-header.component.html",
})
export class ChatHeaderComponent {
  @Input() contact: User | null = null;
  @Input() group: Group | null = null;

  onImageError(event: any) {
    event.target.src = "assets/default-avatar.png";
  }
}
