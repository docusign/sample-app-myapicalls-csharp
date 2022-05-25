import { TestBed } from '@angular/core/testing';
import { ExecutionResultService } from './execution-result.service';
import { IScenarioExecutionResult } from '../models/scenario-execution-result';
import { LocalStorageService } from '../../services/local-storage.service';
import { LocalStorageServiceStub } from '../../services/local-storage.service.stub';

describe('ExecutionResultService', () => {
  let service: ExecutionResultService;

  const results = [
    <IScenarioExecutionResult>{
      dateTime: new Date(),
      scenarioName: 'Scenario 1',
      stepName: 'Step1',
      api: '/v2.1/accounts/{accountId}/envelopes',
      methodType: 'POST',
      requestBody: '<Request 1 text will be shown here>',
      response: '<Response 1 text will be shown here>',
    },
    <IScenarioExecutionResult>{
      dateTime: new Date(),
      scenarioName: 'Scenario 2',
      stepName: 'Step2',
      api: '/v2.1/accounts/{accountId}/envelopes',
      methodType: 'POST',
      requestBody: '<Request 2 text will be shown here>',
      response: '<Response 2 text will be shown here>',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ExecutionResultService, useClass: ExecutionResultService },
        { provide: LocalStorageService, useClass: LocalStorageServiceStub },
      ],
    });
    service = TestBed.inject(ExecutionResultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('execution results should be empty after creation', () => {
    expect(service.executionResults.length).toBe(0);
  });

  it('result items should be empty after creation', () => {
    expect(service.resultItems.getValue().length).toBe(0);
  });

  it('result items should be correct after call next()', () => {
    service.resultItems.next(results);

    const result = service.resultItems.getValue();
    expect(result.length).toBe(2);
    expect(result[0].scenarioName).toBe('Scenario 1');
    expect(result[1].scenarioName).toBe('Scenario 2');
  });

  it('result items should be correct after call addResults()', () => {
    service.addResults(results);

    const result = service.resultItems.getValue();
    expect(result.length).toBe(2);
    expect(result[0].scenarioName).toBe('Scenario 1');
    expect(result[1].scenarioName).toBe('Scenario 2');
  });
});
