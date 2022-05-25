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
        this.url = this.router.url;
      }
    });
  }
  get isLoggedIn(): Observable<boolean> {
    return this.accountService.isLoggedIn();
  }

  logout(): void {
    this.accountService.logout();
  }
}
