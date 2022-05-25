import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IScenarioInfo } from '../models/scenario-info';
import { IStepInfo } from '../models/step-info';
import { IScenarioExecutionResult } from '../models/scenario-execution-result';
import {
  IExecuteScenario,
  IExecuteScenarioStep,
} from '../models/execute-scenario';

@Injectable()
export class ScenarioService {
  constructor(private http: HttpClient) {}
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  getScenarioInfo(scenarioNumber: Number): Observable<IScenarioInfo> {
    return this.http.get<IScenarioInfo>(
      '/api/scenario/' + scenarioNumber,
      this.httpOptions
    );
  }

  getScenarioStepInfo(
    scenarioNumber: Number,
    stepName: string
  ): Observable<IStepInfo> {
    return this.http.get<IStepInfo>(
      '/api/scenario/' + scenarioNumber + '/' + stepName,
      this.httpOptions
    );
  }

  executeScenario(
    model: IExecuteScenario
  ): Observable<IScenarioExecutionResult[]> {
    return this.http.post<IScenarioExecutionResult[]>(
      '/api/scenario/executeScenario',
      model,
      this.httpOptions
    );
  }

  executeScenarioStep(
    model: IExecuteScenarioStep
  ): Observable<IScenarioExecutionResult> {
    return this.http.post<IScenarioExecutionResult>(
      '/api/scenario/executeScenarioStep',
      model,
      this.httpOptions
    );
  }
}
