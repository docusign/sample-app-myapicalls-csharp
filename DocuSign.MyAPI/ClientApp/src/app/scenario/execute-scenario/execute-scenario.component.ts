import { Component, Input, Inject, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { IScenarioInfo } from '../models/scenario-info';
import { AccountService } from '../../services/account-service';
import { ScenarioService } from '../services/scenario-service';
import { ExecutionResultService } from '../services/execution-result.service';
import { IExecuteScenario } from '../models/execute-scenario';
import { ParametersPromptNotificationService } from '../services/parameters-prompts-notification.service';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { IScenarioExecutionResult } from '../models/scenario-execution-result';

@Component({
  selector: 'app-execute-scenario',
  templateUrl: './execute-scenario.component.html',
  styleUrls: ['./execute-scenario.component.scss'],
})
export class ExecuteScenarioComponent {
  @Output() executeEvent = new EventEmitter<boolean>();
  @Input() scenario: IScenarioInfo = {
    name: '',
    title: '',
    sampleFeatures: '',
    codeFlow: '',
    description: '',
    steps: [],
    parameterPrompts: [],
    scenarioNumber: 0,
    completed: false,
  };
  iterations: number = 1;
  outputResults: boolean = false;

  formControl = new FormControl('', [
    Validators.max(10),
    Validators.min(1),
    Validators.required,
    Validators.pattern('[0-9]*'),
  ]);
  matcher = new MyErrorStateMatcher();

  constructor(
    @Inject(AccountService) private accountService: AccountService,
    @Inject(ScenarioService) private scenarioService: ScenarioService,
    @Inject(ExecutionResultService)
    private executionResultService: ExecutionResultService,
    @Inject(ParametersPromptNotificationService)
    private parametersPromptNotificationService: ParametersPromptNotificationService
  ) {}

  onSubmitCallback = (args: any): void => {
    if (this.formControl.valid) {
      this.parametersPromptNotificationService.notifyFormFinished(args);
      const model: IExecuteScenario = {
        scenarioNumber: this.scenario.scenarioNumber,
        parameters: JSON.stringify(args),
        iterationCount: this.iterations,
      };

      this.scenarioService
        .executeScenario(model)
        .subscribe((results: IScenarioExecutionResult[]) => {
          this.scenario.completed =
            results.findIndex((res) => !res.success) < 0;

          if (!this.outputResults) {
            this.executionResultService.addResults(results);
          }

          this.executeEvent.emit(!this.outputResults);
        });
    }
  };

  get isLoggedIn(): Observable<boolean> {
    return this.accountService.isLoggedIn();
  }
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

declare global {
  interface Navigator {
      msSaveBlob?: (blob: any, defaultName?: string) => boolean
  }
}
