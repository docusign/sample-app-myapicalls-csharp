import { Component, Inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { AccountService } from '../services/account-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class AppHeaderComponent implements OnInit {
  url: string = '/';

  constructor(
    private router: Router,
    @Inject(AccountService) private accountService: AccountService
  ) {}

  ngOnInit(): void {
  this.router.events.subscribe((event) => {
    if (event instanceof NavigationEnd) {
      let currentUrl = this.router.url;
      // Only allow relative paths
      if (currentUrl.startsWith('/')) {
        this.url = currentUrl;
      } else {
        this.url = '/';
      }
    }
  });
}
  get isLoggedIn(): Observable<boolean> {
    return this.accountService.isLoggedIn();
  }

  get loggedUserName(): Observable<string> {
    return this.accountService.currentUserName;
  }

  get loggedEmail(): Observable<string> {
    return this.accountService.currentEmail;
  }

  logout(): void {
    this.accountService.logout();
  }
}
