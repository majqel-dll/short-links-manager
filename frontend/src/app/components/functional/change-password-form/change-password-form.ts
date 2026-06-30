import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '@services/user.service';
import { UserData } from '@models/user.types';
import { CanComponentDeactivate } from '@models/guards.types';

@Component({
    selector: 'change-password',
    templateUrl: './change-password-form.html',
    styleUrls: ['./change-password-form.scss',
        '../../../pages/profile-page/profile-page.scss'],
    imports: [ReactiveFormsModule]
})
export class ChangePasswordComponent implements OnInit, CanComponentDeactivate {

    @Input(`currentUser`) currentUser: UserData;

    public unauthorizedResponse: boolean = false;
    public changePasswordForm: FormGroup;

    public showpassword: boolean = false;
    public showNewPassword: boolean = false;
    public showConfirmNewPassword: boolean = false;

    public password: string = null;
    public newPassword: string = null;
    public confirmNewPassword: string = null;

    constructor(
        private readonly usersService: UserService,
    ) { }

    private areEquals(control: FormControl): { [s: string]: boolean } {
        if (control?.value !== this.changePasswordForm?.value?.newPassword) {
            return { 'passwordMustMatch': true }
        }
        return null;
    }

    public canDeactivate(): boolean {
        const form = this.changePasswordForm.value;
        const canLeave = form.password === null && form.password === '' &&
            form.newPassword === null && form.newPassword === '' &&
            form.confirmPassword === null && form.confirmPassword === '';
        return canLeave;
    }

    public ngOnInit(): void {
        this.changePasswordForm = new FormGroup({
            password: new FormControl(null, [Validators.required]),
            newPassword: new FormControl(null, [Validators.required, Validators.minLength(3)]),
            confirmPassword: new FormControl(null, [Validators.required, this.areEquals.bind(this)]),
        });
    }

    public onToggleVisibility(field: string): void {

        if (field === 'password') {
            this.showpassword = !this.showpassword;
        }
        if (field === 'newPassword') {
            this.showNewPassword = !this.showNewPassword;
        }
        if (field === 'confirmPassword') {
            this.showConfirmNewPassword = !this.showConfirmNewPassword;
        }

    }

    public async onPasswordChange(): Promise<void> {
        if (this.changePasswordForm.status === 'VALID') {
            const { password, newPassword, confirmPassword } = this.changePasswordForm.value;
            const body = { password, newPassword, confirmPassword };

            const response = await this.usersService.changeUserPassword(body);
            this.unauthorizedResponse = !response;
            this.changePasswordForm.reset();
        }
    }

}