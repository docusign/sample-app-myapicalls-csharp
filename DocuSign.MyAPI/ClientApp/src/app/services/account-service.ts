import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AccountService {
  accountId: string = '';
  accountReceived: boolean = false;
  accountId$ = new BehaviorSubject(this.accountId);
  logoutActions$: Observable<any>[] = new Array();

  constructor(private http: HttpClient) {
    this.getAccountId().subscribe(
      (account) => {
        this.accountId = account.id;
        this.accountId$.next(account.id);
        this.accountReceived = true;

        return this.accountId.length > 0;
      },
      (error) => {
        console.log(error);
        this.accountReceived = true;
      }
    );
  }
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  get currentAccountId(): Observable<string> {
    return this.accountId$;
  }

  private getAccountId(): Observable<any> {
    return this.http.get('api/account', this.httpOptions);
  }

  logout() {
    forkJoin(this.logoutActions$).subscribe(() => {
      window.location.href = '/account/logout';
    });
  }

  isLoggedIn(): Observable<boolean> {
    return this.currentAccountId.pipe(
      map((accountId) => {
        return accountId.length > 0;
      })
    );
  }
}
