import { Injectable, Inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../services/notification-service';

@Injectable()
export class ErrorHanlderInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    @Inject(TranslateService) private translateService: TranslateService,
    @Inject(NotificationService)
    private notificationService: NotificationService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status !== 401) {
            if(error.status === 409) {
              this.notificationService.showError(error.error?.message);
              return throwError(error);
            }
            this.translateService.get('ERRORS.500').subscribe((res: string) => {
              this.notificationService.showError(res);
            });
            return throwError(error);
          } else if (error.status === 401) {
            this.translateService.get('ERRORS.401').subscribe((res: string) => {
              let snackBarRef = this.notificationService.showInfo(res);

              snackBarRef.afterDismissed().subscribe(() => {
                let returnUrl = this.router.url;
                // Only allow relative paths
                if (!returnUrl.startsWith('/')) {
                  returnUrl = '/';
                }
                window.location.href =
                  '/account/login?returnUrl=' + returnUrl;
              });
            });
          }
        }

        return throwError(error);
      })
    );
  }
}
