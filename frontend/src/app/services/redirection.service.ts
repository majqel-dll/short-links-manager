import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class RedirectionService {

    public categories: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    public redirections: BehaviorSubject<unknown[]> = new BehaviorSubject<unknown[]>([]);

    public async getRedirections(): Promise<void> { }
    
}