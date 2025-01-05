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
  template: `
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg w-[500px] max-h-[80vh] flex flex-col">
        <div class="p-4 border-b">
          <h2 class="text-xl font-semibold">Create New Group</h2>
        </div>

        <form [formGroup]="groupForm" (ngSubmit)="createGroup()" class="p-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Group Name</label
            >
            <input
              type="text"
              formControlName="name"
              class="w-full p-2 border rounded focus:outline-none focus:border-[#708D81]"
              placeholder="Enter group name"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Description</label
            >
            <textarea
              formControlName="description"
              class="w-full p-2 border rounded focus:outline-none focus:border-[#708D81]"
              placeholder="Enter group description"
              rows="2"
            ></textarea>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Select Members</label
            >
            <div class="max-h-[200px] overflow-y-auto border rounded p-2">
              <div
                *ngFor="let user of availableUsers"
                class="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                (click)="toggleUserSelection(user)"
              >
                <input
                  type="checkbox"
                  [checked]="isUserSelected(user)"
                  class="mr-2"
                  (click)="$event.stopPropagation()"
                  (change)="toggleUserSelection(user)"
                />
                <img
                  [src]="
                    'http://localhost:8081/api/users/profile-picture/' +
                    user.username
                  "
                  class="w-8 h-8 rounded-full object-cover mr-2"
                  [alt]="user.username"
                  (error)="onImageError($event)"
                />
                <span>{{ user.username }}</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <button
              type="button"
              (click)="onClose.emit()"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="!groupForm.valid || selectedUsers.length === 0"
              class="px-4 py-2 bg-[#708D81] text-white rounded hover:bg-[#5a7267] disabled:opacity-50"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
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
