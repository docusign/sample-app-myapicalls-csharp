import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IParameterPrompt } from '../models/parameter-prompt';
import { ParameterPromptType } from '../models/parameter-prompt-type';
import { IScenarioInfo } from '../models/scenario-info';
import { IScenarioStep } from '../models/scenario-step';
import { IStepInfo } from '../models/step-info';
import { IScenarioExecutionResult } from '../models/scenario-execution-result';
import {
  IExecuteScenario,
  IExecuteScenarioStep,
} from '../models/execute-scenario';

@Injectable()
export class ScenarioServiceStub {
  constructor() {}

  getScenarioInfo(scenarioNumber: Number): Observable<IScenarioInfo> {
    return of(<IScenarioInfo>{
      name: 'EmbeddedSignature',
      title: 'Scenario title 2',
      description: ` Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
      velit esse cillum dolore eu fugiat nulla pariatur.`,
      steps: [
        <IScenarioStep>{
          name: 'Step 1',
          title: 'Step title 1',
          shortDescription: 'Step short description 1',
        },
        <IScenarioStep>{
          name: 'Step 2',
          title: 'Step title 2',
          shortDescription: 'Step short description 2',
        },
      ],
      parameterPrompts: [
        <IParameterPrompt>{
          stepName: 'Step1',
          name: 'signerName',
          defaultValue: '',
          title: 'Signer Name',
          type: ParameterPromptType.string,
          requestParameterType: 'asasdasd',
          requestParameterPath: 'cczxczxc',
          note: 'Name of the signer',
          required: false,
          options: undefined,
        },
        <IParameterPrompt>{
          stepName: 'Step1',
          name: 'signerEmail',
          title: 'Signer Email',
          type: ParameterPromptType.email,
          note: 'Email where document for signing will be sent',
          required: true,
        },
        <IParameterPrompt>{
          stepName: 'Step1',
          name: 'comment',
          title: 'Comment',
          type: ParameterPromptType.text,
          note: 'Comment',
          required: true,
        },
        <IParameterPrompt>{
          stepName: 'Step2',
          name: 'document',
          title: 'Document',
          type: ParameterPromptType.file,
          note: 'Document must be max 5MB size, Format: .doc, .pdf',
          required: true,
        },
        <IParameterPrompt>{
          stepName: 'Step2',
          name: 'signatureType',
          title: 'Signature Type',
          type: ParameterPromptType.select,
          note: 'Signature type',
          required: true,
          options: [
            {
              key: 'Simple',
              value: 'Simple Signature',
            },
            {
              key: 'AES',
              value: 'Advanced signature',
            },
            {
              key: 'QES',
              value: 'Qualified signature',
            },
          ],
        },
      ],
    });
  }

  getScenarioStepInfo(
    scenarioNumber: Number,
    stepName: string
  ): Observable<IStepInfo> {
    return of(<IStepInfo>{
      name: 'Step 1',
      title: 'Step title 1',
      description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur.`,
      api: '/v2.1/accounts/{accountId}/envelopes',
      method: 'POST',
      parameterPrompts: [
        <IParameterPrompt>{
          stepName: 'Step1',
          name: 'signerName',
          title: 'Signer Name',
          type: 'string',
          note: 'Name of the signer',
          required: false,
        },
        <IParameterPrompt>{
          stepName: 'Step1',
          name: 'signerEmail',
          title: 'Signer Email',
          type: ParameterPromptType.email,
          note: 'Email where document for signing will be sent',
          required: true,
        },
      ],
      bodyTemplate: '{ "emailSubject": "[emailSubject]" }',
      documentationUrl: 'http://some.url/',
      requestParameters: [],
    });
  }

  executeScenario(
    model: IExecuteScenario
  ): Observable<IScenarioExecutionResult[]> {
    return of([
      <IScenarioExecutionResult>{
        dateTime: new Date(),
        scenarioName: 'Create an envelope for remote signing',
        stepName: 'Step1 Create template from Attached  document',
        api: '/v2.1/accounts/{accountId}/envelopes',
        methodType: 'POST',
        requestBody: `<Request 1 text will be shown here>
      {status:”agreed”,documentData:{},
      documentData : {}
      documents :[]
      status: “agreed”`,
        response: `<Response 1 text will be shown here>
      {“accountId”:”556345-34535456-45656756,
      “clickwrapId”: “3453456-c5667-dfgdfg5”,`,
      },
      <IScenarioExecutionResult>{
        dateTime: new Date(),
        scenarioName: 'Create an envelope for remote signing',
        stepName: 'Step1 Create template from Attached  document',
        api: '/v2.1/accounts/{accountId}/envelopes',
        methodType: 'POST',
        requestBody: `<Request 1 text will be shown here>
      {status:”agreed”,documentData:{},
      documentData : {}
      documents :[]
      status: “agreed”`,
        response: `<Response 1 text will be shown here>
      {“accountId”:”556345-34535456-45656756,
      “clickwrapId”: “3453456-c5667-dfgdfg5”,`,
      },
    ]);
  }

  executeScenarioStep(
    model: IExecuteScenarioStep
  ): Observable<IScenarioExecutionResult> {
    return of(<IScenarioExecutionResult>{
      dateTime: new Date(),
      scenarioName: 'Create an envelope for remote signing',
      stepName: 'Step1 Create template from Attached  document',
      api: '/v2.1/accounts/{accountId}/envelopes',
      methodType: 'POST',
      requestBody: `<Request 1 text will be shown here>
      {status:”agreed”,documentData:{},
      documentData : {}
      documents :[]
      status: “agreed”`,
      response: `<Response 1 text will be shown here>
      {“accountId”:”556345-34535456-45656756,
      “clickwrapId”: “3453456-c5667-dfgdfg5”,`,
    });
  }
}
