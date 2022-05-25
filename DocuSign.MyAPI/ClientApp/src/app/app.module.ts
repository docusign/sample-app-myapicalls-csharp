import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  HttpClientModule,
  HttpClient,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppHeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { environment } from 'src/environments/environment';
import { ScenariosServiceStub } from './home/scenarios/services/scenarios.service.stub';
import { ScenariosService } from './home/scenarios/services/scenarios.service';
import { ScenarioModule } from './scenario/scenario.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoaderComponent } from './loader/loader.component';
import { AccountService } from './services/account-service';
import { AccountServiceStub } from './services/account-service.stub';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ErrorHanlderInterceptor } from './core/errorhandler.inteceptor';
import { NotificationService } from './services/notification-service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LocalStorageService } from './services/local-storage.service';

export function HttpLoaderFactory(http: HttpClient): TranslateLoader {
  return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    AppHeaderComponent,
    FooterComponent,
    LoaderComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ScenarioModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      useDefaultLang: false,
    }),
    MatSnackBarModule,
  ],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorHanlderInterceptor,
      multi: true,
    },
    {
      provide: ScenariosService,
      useClass:
        environment.stubBackend == true
          ? ScenariosServiceStub
          : ScenariosService,
    },
    {
      provide: AccountService,
      useClass:
        environment.stubBackend == true ? AccountServiceStub : AccountService,
    },
    {
      provide: LocalStorageService,
      useClass: LocalStorageService,
    },
    {
      provide: NotificationService,
      useClass: NotificationService,
    },
  ],
})
export class AppModule {}
