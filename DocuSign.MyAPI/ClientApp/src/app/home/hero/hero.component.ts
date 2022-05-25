import { Component, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountService } from '../../services/account-service';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent {
  constructor(@Inject(AccountService) private accountService: AccountService) {}

  get isLoggedIn(): Observable<boolean> {
    return this.accountService.isLoggedIn();
  }
}
