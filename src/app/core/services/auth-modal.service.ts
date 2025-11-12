import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

type AuthModalCommand = 'login' | 'register' | 'close';

@Injectable({ providedIn: 'root' })
export class AuthModalService {
  private readonly openSubject = new Subject<AuthModalCommand>();
  readonly open$ = this.openSubject.asObservable();

  openLogin(): void {
    this.openSubject.next('login');
  }

  openRegister(): void {
    this.openSubject.next('register');
  }

  closeAll(): void {
    this.openSubject.next('close');
  }
}
