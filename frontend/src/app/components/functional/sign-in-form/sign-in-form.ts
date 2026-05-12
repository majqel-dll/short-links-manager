import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "@services/auth.service";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
    selector: 'sign-in-form',
    templateUrl: './sign-in-form.html',
    styleUrls: ['./sign-in-form.scss'],
    imports: [ReactiveFormsModule],
})

export class SignInFormComponent implements OnInit {

    constructor(
        private readonly authService: AuthService,
        private readonly router: Router,
    ) { }

    protected accessDenied: boolean = false;
    protected loginForm: FormGroup;
    protected isPasswordVisible = false;

    public ngOnInit(): void {
        this.loginForm = new FormGroup({
            login: new FormControl(null, [Validators.required]),
            password: new FormControl(null, [Validators.required]),
        })
    };

    protected async onSubmit(): Promise<void> {
        if (this.loginForm.status === 'VALID') {
            
            const request = await this.authService.signIn(
                this.loginForm.get(`login`).value,
                this.loginForm.get(`password`).value
            );

            this.loginForm.reset();
            if (request) {
                this.router.navigate(['']);
            } else {
                this.accessDenied = true;
            }
        }
    };

    protected togglePasswordVisibility = (): void => {
        this.isPasswordVisible = !this.isPasswordVisible;
    }
}