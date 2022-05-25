import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable()
export class AccountServiceStub {
  accountId: string = '';

  constructor() {}

  get currentAccountId(): Observable<string> {
    return of(<string>this.accountId);
  }

  isLoggedIn(): Observable<boolean> {
    return of(<boolean>(this.accountId.length > 0));
  }
}
