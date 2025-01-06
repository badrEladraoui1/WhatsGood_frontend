import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { User } from "../../../models/user.model";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";

@Component({
  selector: "app-create-group-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./create-group-modal.component.html",
})
export class CreateGroupModalComponent {
  @Input() availableUsers: User[] = [];
  @Output() onClose = new EventEmitter<void>();
  @Output() onCreateGroup = new EventEmitter<{
    name: string;
    description: string;
    members: string[];
  }>();

  groupForm: FormGroup;
  selectedUsers: User[] = [];

  constructor(private fb: FormBuilder) {
    this.groupForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(3)]],
      description: ["", Validators.required],
    });
  }

  toggleUserSelection(user: User) {
    const index = this.selectedUsers.findIndex((u) => u.id === user.id);
    if (index === -1) {
      this.selectedUsers.push(user);
    } else {
      this.selectedUsers.splice(index, 1);
    }
  }

  isUserSelected(user: User): boolean {
    return this.selectedUsers.some((u) => u.id === user.id);
  }

  createGroup() {
    if (this.groupForm.valid && this.selectedUsers.length > 0) {
      this.onCreateGroup.emit({
        name: this.groupForm.value.name,
        description: this.groupForm.value.description,
        members: this.selectedUsers.map((user) => user.username),
      });
    }
  }

  onImageError(event: any) {
    event.target.src = "assets/default-avatar.png";
  }
}
