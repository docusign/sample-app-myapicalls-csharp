import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IScenarioExecutionResult } from '../models/scenario-execution-result';
import { LocalStorageService } from '../../services/local-storage.service';

@Injectable()
export class ExecutionResultService {
  constructor(
    @Inject(LocalStorageService)
    private localStorageService: LocalStorageService
  ) {}

  executionResults: IScenarioExecutionResult[] = [];
  resultItems = new BehaviorSubject(this.executionResults);

  getResults(): Observable<IScenarioExecutionResult[]> {
    return this.localStorageService.getResults().pipe(
      tap((res) => {
        this.executionResults = res;
        this.resultItems.next(res);
      })
    );
  }

  addResults(results: IScenarioExecutionResult[]) {
    this.executionResults = this.executionResults
      .concat(results)
      .sort(function (a, b) {
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
      });
    this.resultItems.next(this.executionResults);
    this.localStorageService.setResults(this.executionResults);
  }

  getLatestResponsesWithinScenario(
    scenarioId: number
  ): IScenarioExecutionResult[] {
    return this.executionResults
      .filter((result) => result.scenarioId == scenarioId)
      .filter(
        (value, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.stepName === value.stepName &&
              t.scenarioName === value.scenarioName
          )
      );
  }

  clearResults() {
    this.executionResults = [];
    this.resultItems.next(this.executionResults);
    this.localStorageService.setResults(this.executionResults);
  }
}
