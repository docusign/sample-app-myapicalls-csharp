import { TestBed } from '@angular/core/testing';
import { FileService } from './file.service';
import { IScenarioExecutionResult } from '../models/scenario-execution-result';

describe('FileService', () => {
  let service: FileService;

  const date = new Date();
  const input = [
    <IScenarioExecutionResult>{
      dateTime: date,
      scenarioName: 'Scenario1',
      stepName: 'Step1',
      api: '/v2.1/accounts/{accountId}/envelopes',
      methodType: 'POST',
      requestBody: '<Request 1 text will be shown here>',
      response: '<Response 1 text will be shown here>',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: FileService, useClass: FileService }],
    });
    service = TestBed.inject(FileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('CSV file should be created', () => {
    const expected =
      'dateTime,scenarioName,stepName,api,methodType,requestBody,response\r\n"' +
      date.toString() +
      '","Scenario1","Step1","/v2.1/accounts/{accountId}/envelopes","POST","<Request 1 text will be shown here>","<Response 1 text will be shown here>"';

    const result = service.convertToCSV(input);
    expect(result).toContain(expected);
  });

  it('blob should be created', () => {
    const result = service.getBlob(input);
    expect(result.type).toBe('text/csv;charset=utf-8;');
  });
});
