import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IScenarioExecutionResult } from '../scenario/models/scenario-execution-result';

@Injectable()
export class LocalStorageServiceStub {
  constructor() {}

  getResults(): Observable<IScenarioExecutionResult[]> {
    return of(<IScenarioExecutionResult[]>[
      <IScenarioExecutionResult>{
        dateTime: new Date(),
        scenarioName: 'Scenario1',
        stepName: 'Step1',
        api: '/v2.1/accounts/{accountId}/envelopes',
        methodType: 'POST',
        requestBody: '<Request 1 text will be shown here>',
        response: '<Response 1 text will be shown here>',
      },
      <IScenarioExecutionResult>{
        dateTime: new Date(),
        scenarioName: 'Scenario2',
        stepName: 'Step2',
        api: '/v2.1/accounts/{accountId}/envelopes',
        methodType: 'POST',
        requestBody: '<Request 2 text will be shown here>',
        response: '<Response 2 text will be shown here>',
      },
    ]);
  }

  setResults(results: IScenarioExecutionResult[]) {}
}
