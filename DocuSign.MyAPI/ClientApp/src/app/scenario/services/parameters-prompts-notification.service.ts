import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { IParameterValue } from '../models/parameter-prompt';

@Injectable()
export class ParametersPromptNotificationService {
  constructor() {}

  parameter$ = new ReplaySubject<IParameterValue>(20);

  formData$ = new ReplaySubject<any>(5);

  notifyChange(parameterValue: IParameterValue) {
    this.parameter$.next(parameterValue);
  }

  notifyFormFinished(formData: any) {
    this.formData$.next(formData);
  }
}
