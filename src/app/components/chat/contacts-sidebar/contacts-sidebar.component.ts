import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { User } from "../../../models/user.model";
import { formatLastMessageTime } from "../../../utils/date.utils";
import { CreateGroupModalComponent } from "../group/create-group-modal.component";
import { Group } from "../../../models/groupe.model";

@Component({
  selector: "app-contacts-sidebar",
  standalone: true,
  imports: [CommonModule, CreateGroupModalComponent, CreateGroupModalComponent],
  templateUrl: "./contacts-sidebar.component.html",
})
export class ContactsSidebarComponent {
  @Input() contacts: User[] = [];
  @Input() groups: Group[] = [];
  @Input() selectedContactId?: number;
  @Input() selectedGroupId?: number;
  @Output() onSelectContact = new EventEmitter<User>();
  @Output() onSelectGroup = new EventEmitter<Group>();
  @Output() onCreateGroup = new EventEmitter<{
    name: string;
    description: string;
    members: string[];
  }>();

  activeTab: "contacts" | "groups" = "contacts";
  showCreateGroup = false;

  formatTime(date?: Date) {
    return date ? formatLastMessageTime(date) : "";
  }

  handleCreateGroup(groupData: {
    name: string;
    description: string;
    members: string[];
  }) {
    console.log("Creating group:", groupData); // Add logging

    this.onCreateGroup.emit(groupData);
    this.showCreateGroup = false;
  }

  onImageError(event: any) {
    event.target.src = "assets/default-avatar.png";
  }
}
