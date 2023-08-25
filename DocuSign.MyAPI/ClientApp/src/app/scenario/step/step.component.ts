import {
  Component,
  OnInit,
  Input,
  Inject,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { Observable } from 'rxjs';
import { ScenarioService } from '../services/scenario-service';
import { IStepInfo, IParameter } from '../models/step-info';
import { IScenarioStep } from '../models/scenario-step';
import { AccountService } from '../../services/account-service';
import { ParametersPromptComponent } from '../parameters-prompt/parameters-prompt.component';
import { ExecutionResultService } from '../services/execution-result.service';
import { ParametersPromptNotificationService } from '../services/parameters-prompts-notification.service';
import { IParameterValue } from '../models/parameter-prompt';
import {
  IExecuteScenarioStep,
  IStepResponse,
} from '../models/execute-scenario';
import { IScenarioExecutionResult } from '../models/scenario-execution-result';
import { TranslateService } from '@ngx-translate/core';
interface Dictionary<T> {
  [Key: string]: T;
}
@Component({
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss'],
})
export class StepComponent implements OnInit {
  @ViewChild('parametersPromptComponent')
  parametersPromptComponent!: ParametersPromptComponent;
  @Input() step!: IScenarioStep;
  @Input() scenarioId!: number;
  @Input() stepIndex!: number;
  @Output() executeEvent = new EventEmitter<boolean>();
  pathParam: Dictionary<string> = {};

  stepInfo: IStepInfo = {
    name: '',
    title: '',
    description: '',
    api: '',
    method: '',
    parameterPrompts: [],
    bodyTemplate: '',
    documentationUrl: '',
    requestParameters: [],
  };
  requestBody: string = '';
  responseBody: string = '';
  outputResults: boolean = false;
  jsonBody: string = '';
  apiUrl: string = '';

  constructor(
    @Inject(ScenarioService) private scenarioService: ScenarioService,
    @Inject(AccountService) private accountService: AccountService,
    @Inject(ExecutionResultService)
    private executionResultService: ExecutionResultService,
    @Inject(ParametersPromptNotificationService)
    private parametersPromptNotificationService: ParametersPromptNotificationService,
    @Inject(TranslateService) private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.scenarioService
      .getScenarioStepInfo(this.scenarioId, this.step.name)
      .subscribe((step) => {
        //added to fix step execution
        step.parameterPrompts.forEach((parameter) => {
          parameter.stepName = step.name;
        });

        this.jsonBody = JSON.parse(step.bodyTemplate);

        this.stepInfo = step;
        this.requestBody = JSON.stringify(this.jsonBody, null, 1);
        this.apiUrl = step.api;
        this.accountService.currentAccountId.subscribe((accountId) => {
          if (accountId.length > 0) {
            this.apiUrl = step.api.replace('{accountId}', accountId);
            this.pathParam['accountId'] = accountId;
          }
        });

        this.parametersPromptNotificationService.parameter$.subscribe(
          (data) => {
            if(data.parameter.stepName == this.step.name) {
              this.updateRequestBody(data);
              this.updateRequestPath(data);
            }
          }
        );

        this.executionResultService.resultItems.subscribe((results) => {
          this.getParameterFromResponse(results);
        });
      });
  }

  updateRequestBody(data: IParameterValue) {
    if (
      this.stepInfo.bodyTemplate === '{}' ||
      this.stepInfo.bodyTemplate === ''
    ) {
      this.localizeRequestBody(this.stepInfo.bodyTemplate);
    } else {
      if (data.parameter !== undefined) {
        const jp = require('jsonpath');

        if (data.parameter.type === 'file') {
          const paramPaths = data.parameter.requestParameterPath.split(';');
          const paramValues = data.value.split(';');

          for (let index = 0; index < paramPaths.length; index++) {
            if (paramPaths[index] !== '') {
              jp.apply(this.jsonBody, paramPaths[index], function (value: any) {
                return paramValues[index];
              });
            }
          }
        } else {
          jp.apply(
            this.jsonBody,
            data.parameter.requestParameterPath,
            function (value: any) {
              return data.value;
            }
          );
        }

        this.requestBody = this.getRequestBody(
          JSON.stringify(this.jsonBody, null, 1)
        );
      }
    }
  }

  updateRequestPath(data: IParameterValue) {
    if (data.parameter.requestParameterType === 'path') {
      this.updatePath(data.parameter.name, data.value);
    }
  }

  updatePath(parameterName: string, value: string) {
    this.pathParam[parameterName] = value;
    var resultingPath = this.stepInfo.api;
    for (var param in this.pathParam) {
      resultingPath = resultingPath.replace(
        '{' + param + '}',
        this.pathParam[param]
      );
    }
    this.apiUrl = resultingPath.replace(/,/g, ',\u200B');
  }

  getParameterFromResponse(results: IScenarioExecutionResult[]) {
    this.stepInfo.requestParameters.forEach((parameter: IParameter) => {
      if (parameter.in === 'body' || parameter.in === 'path') {
        var previousStep = this.executionResultService
          .getLatestResponsesWithinScenario(this.scenarioId)
          .find((r) => r.stepName === parameter.source);
        if (previousStep !== undefined) {
          const json = JSON.parse(previousStep.response);
          const jp = require('jsonpath');
          const value = jp.value(json, parameter.responseParameterPath);

          if (value !== undefined) {
            if (parameter.in === 'body') {
              const newParameter: IParameterValue = {
                parameter: {
                  stepName: parameter.source,
                  name: parameter.name,
                  defaultValue: '',
                  title: '',
                  type: '',
                  requestParameterType: '',
                  requestParameterPath: parameter.requestParameterPath,
                  note: '',
                  required: false,
                },
                value: value,
              };

              this.updateRequestBody(newParameter);
            } else if (parameter.in === 'path') {
              this.updatePath(parameter.name, value);
            }
          }
        }
      }
    });
  }

  onSubmitCallback = (args: string): void => {
    var previousResponses: IStepResponse[] = [];
    if (this.stepIndex > 0) {
      previousResponses = this.executionResultService
        .getLatestResponsesWithinScenario(this.scenarioId)
        .map(
          (item) =>
            <IStepResponse>{ stepName: item.stepName, response: item.response }
        );
    }
    const model: IExecuteScenarioStep = {
      scenarioNumber: this.scenarioId,
      stepName: this.stepInfo.name,
      parameters: args === null ? '' : JSON.stringify(args),
      previousStepResponses: previousResponses,
    };

    this.scenarioService
      .executeScenarioStep(model)
      .subscribe((result: IScenarioExecutionResult) => {
        this.step.completed = result.success;

        try {
          this.responseBody = JSON.stringify(
            JSON.parse(result.response),
            null,
            1
          );
        } catch (e) {
          this.localizeResponseBody(result.response);
        }

        if (!this.outputResults) {
          this.executionResultService.addResults([result]);
        }

        this.executeEvent.emit(!this.outputResults);
      });
  };

  getRequestBody(body: string): string {
    try {
      const json = JSON.parse(body);

      this.truncateNodeValue(json);

      return JSON.stringify(json, null, 1);
    } catch (e) {
      return body;
    }
  }

  truncateNodeValue(node: any) {
    Object.entries(node).map((child) => {
      const value = child[1];

      if (value != null && typeof value === 'object') {
        this.truncateNodeValue(value);
      } else if (typeof value === 'string' && value.length > 50) {
        node[child[0]] = value.substring(0, 50) + '...';
      }
    });
  }

  localizeResponseBody(response: string) {
    if (response === '{}' || response === '') {
      this.translateService
        .get('EXECUTE.STEP.NO_RESPONSE_BODY')
        .subscribe((res: string) => {
          this.responseBody = res;
        });
    }
  }
  localizeRequestBody(request: string) {
    if (request === '{}' || request === '') {
      this.translateService
        .get('EXECUTE.STEP.NO_REQUEST_BODY')
        .subscribe((res: string) => {
          this.requestBody = res;
        });
    }
  }

  executeStep() {
    this.parametersPromptComponent.onSubmit();
  }

  get isLoggedIn(): Observable<boolean> {
    return this.accountService.isLoggedIn();
  }
}
