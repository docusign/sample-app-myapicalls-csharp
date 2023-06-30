import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AccountService {
  accountId: string = '';
  userName: string = '';
  email: string = '';
  accountReceived: boolean = false;
  accountId$ = new BehaviorSubject(this.accountId);
  userName$ = new BehaviorSubject(this.userName);
  email$ = new BehaviorSubject(this.email);
  logoutActions$: Observable<any>[] = new Array();

  constructor(private http: HttpClient) {
    this.getAccountInfo().subscribe(
      (info) => {
        this.accountId = info.id;
        this.accountId$.next(info.id);
        this.accountReceived = true;

        this.userName = info.name;
        this.userName$.next(info.name);

        this.email = info.email;
        this.email$.next(info.email);

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

  get currentUserName(): Observable<string> {
    return this.userName$;
  }

  get currentEmail(): Observable<string> {
    return this.email$;
  }

  private getAccountInfo(): Observable<any> {
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
