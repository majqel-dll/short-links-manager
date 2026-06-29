import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '@services/user.service';

@Component({
    selector: 'change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss', './../user-profile.component.scss'],
})
export class ChangePasswordComponent implements OnInit {

    @Input(`currentUser`) currentUser: User;

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
        private readonly canLeave: CanDeactivateService,
    ) { }

    private areEquals(control: FormControl): { [s: string]: boolean } {
        if (control?.value !== this.changePasswordForm?.value?.newPassword) {
            return { 'passwordMustMatch': true }
        }
        return null;
    }

    public ngOnInit(): void {
        this.changePasswordForm = new FormGroup({
            password: new FormControl(null, [Validators.required]),
            newPassword: new FormControl(null, [Validators.required, Validators.minLength(3)]),
            confirmPassword: new FormControl(null, [Validators.required, this.areEquals.bind(this)]),
        });

        this.changePasswordForm.valueChanges.subscribe((value) => {

            if (value.password !== null && value.password !== '' ||
                value.newPassword !== null && value.newPassword !== '' ||
                value.confirmPassword !== null && value.confirmPassword !== ''
            ) {
                this.canLeave.getSubject('changePassword').next(true);
            } else {
                this.canLeave.getSubject('changePassword').next(false);
            }
        })
    }

    public onToggleVisibility = (field: string): void => {

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

    public onPasswordChange = async (): Promise<void> => {
        if (this.changePasswordForm.status === 'VALID') {
            const { password, newPassword, confirmPassword } = this.changePasswordForm.value;
            const body = { password, newPassword, confirmPassword };

            const response = await this.usersService.changeUserPassword(body);
            this.unauthorizedResponse = !response;
            this.changePasswordForm.reset();
        }
    }

}