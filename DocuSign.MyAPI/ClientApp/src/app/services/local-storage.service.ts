import { Injectable, Inject } from '@angular/core';
import { defer, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { IScenarioExecutionResult } from '../scenario/models/scenario-execution-result';
import { AccountService } from '../services/account-service';
import { IStepParameters } from '../scenario/models/execute-scenario';

@Injectable()
export class LocalStorageService {
  constructor(@Inject(AccountService) private accountService: AccountService) {}

  accountId: string | undefined = undefined;

  getResults(): Observable<IScenarioExecutionResult[]> {
    return this.accountService.currentAccountId.pipe(
      map((account: any) => {
        var results: IScenarioExecutionResult[] = [];
        this.accountId = account;
        const item = localStorage.getItem(account);
        if (item !== null) {
          results = JSON.parse(item);
        }
        return results;
      })
    );
  }

  setResults(results: IScenarioExecutionResult[]) {
    if (this.accountId !== undefined && this.accountId.length > 0) {
      localStorage.setItem(this.accountId, JSON.stringify(results));
    }
  }

  setStepParameters(scenarioNumber: number, stepParameters: IStepParameters[]) {
    localStorage.setItem(scenarioNumber + "_parameters", JSON.stringify(stepParameters));
  }

  getStepParameters(scenarioNumber: number): IStepParameters[] {
    let stepParameters: IStepParameters[] = [];
    const item = localStorage.getItem(scenarioNumber + "_parameters");
    if (item !== null) {
      stepParameters = JSON.parse(item);
    }
    return stepParameters;
  }

  setItem(name: string, value: string){
    localStorage.setItem(name, value);
  }

  getItem(name: string): string | null {
    return localStorage.getItem(name);
  }

  clearStorage() {
    this.setResults([]);
  }

  configureCleanupOnLogout() {
    this.accountService.logoutActions$.push(
      defer(() => of(this.clearStorage()))
    );
  }
}
