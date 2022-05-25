import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from './services/local-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(
    private translateService: TranslateService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.localStorageService.configureCleanupOnLogout();
    this.translateService.use(environment.defaultLanguage);
  }
}
