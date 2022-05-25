import { Injectable, Inject } from '@angular/core';
import {
  MatSnackBar,
  TextOnlySnackBar,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class NotificationService {
  closeTitle: string = 'Close';

  constructor(
    private snackBar: MatSnackBar,
    @Inject(TranslateService) private translateService: TranslateService
  ) {}

  showError(message: string): MatSnackBarRef<TextOnlySnackBar> {
    this.translateService.get('CLOSE').subscribe((res: string) => {
      this.closeTitle = res;
    });

    return this.snackBar.open(message, this.closeTitle, {
      panelClass: 'snackbar_error',
    });
  }

  showInfo(message: string): MatSnackBarRef<TextOnlySnackBar> {
    this.translateService.get('CLOSE').subscribe((res: string) => {
      this.closeTitle = res;
    });

    return this.snackBar.open(message, this.closeTitle, {
      panelClass: 'snackbar_info',
    });
  }
}
