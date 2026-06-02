import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class CodeService {

    public async askForVerificationEmail(): Promise<void> { }

    public async verifyByRequest(): Promise<void> { }

}