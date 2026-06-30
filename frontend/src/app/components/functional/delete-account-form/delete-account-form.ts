import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { UserService } from "@services/user.service";
import { AuthService } from "@services/auth.service";
import { Component, Input } from "@angular/core";
import { UserData } from "@models/user.types";
import { Router } from "@angular/router";


@Component({
    selector: 'delete-account',
    templateUrl: './delete-account-form.html',
    styleUrls: [
        './delete-account-form.scss',
        '../../../pages/profile-page/profile-page.scss'
    ],
    imports: [
        ReactiveFormsModule
    ]
})

export class DeleteAccountComponent {

    @Input(`currentUser`) currentUser: UserData;

    protected isPasswordVisible: boolean = false;
    protected deleteAccountForm: FormGroup;
    protected procesStarted: boolean = false;
    protected error: boolean = false;

    constructor(
        private readonly router: Router,
        private readonly userService: UserService,
        private readonly auth: AuthService,
    ) {

    }
    protected onStartDeleteProcess = async (): Promise<void> => {
        if (!this.deleteAccountForm) {
            this.deleteAccountForm = new FormGroup({
                confirmDeleteWithLogin: new FormControl(null, [Validators.required, Validators.minLength(3)]),
                confirmDeleteWithPassword: new FormControl(null, [Validators.required, Validators.minLength(3)]),
            })
        }
        this.procesStarted = true;
    }

    protected onDeleteAccount = async (): Promise<void> => {

        const canDelete = window.confirm('This action is permanent, are you sure?')
        if (canDelete && this.deleteAccountForm.valid) {
            const body = {
                login: this.deleteAccountForm.value.confirmDeleteWithLogin,
                password: this.deleteAccountForm.value.confirmDeleteWithPassword,
            }

            this.error = !await this.userService.deactivateUser(body);
            this.deleteAccountForm.reset();
            if (!this.error) {
                this.auth.signOut();
                this.router.navigate(['/login']);
            }
        } else {
            this.deleteAccountForm.reset();
        }
    }
    protected togglePasswordVisibility = (): void => {
        this.isPasswordVisible = !this.isPasswordVisible;
    }

    protected onCancel(): void {
        this.procesStarted = false;
    }
}