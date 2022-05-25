import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import { ExecutionResultsComponent } from './execution-results.component';
import { ExecutionResultService } from '../services/execution-result.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { LocalStorageServiceStub } from '../../services/local-storage.service.stub';
import { AccountService } from '../../services/account-service';
import { AccountServiceStub } from '../../services/account-service.stub';
import { FileService } from '../services/file.service';
import { IScenarioExecutionResult } from '../models/scenario-execution-result';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';

describe('ExecutionResultsComponent', () => {
  let component: ExecutionResultsComponent;
  let fixture: ComponentFixture<ExecutionResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatTableModule, TranslateModule.forRoot()],
      declarations: [ExecutionResultsComponent],
      providers: [
        { provide: ExecutionResultService, useClass: ExecutionResultService },
        { provide: AccountService, useClass: AccountServiceStub },
        { provide: LocalStorageService, useClass: LocalStorageServiceStub },
        { provide: FileService, useClass: FileService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionResultsComponent);
    component = fixture.componentInstance;
    component.results = [
      <IScenarioExecutionResult>{
        dateTime: new Date(2022, 1, 1, 1, 50),
        scenarioName: 'Scenario1',
        stepName: 'Step1',
        api: '/v2.1/accounts/{accountId}/envelopes',
        methodType: 'POST',
        requestBody: '<Request 1 text will be shown here>',
        response: '<Response 1 text will be shown here>',
      },
      <IScenarioExecutionResult>{
        dateTime: new Date(2022, 1, 1, 1, 55),
        scenarioName: 'Scenario2',
        stepName: 'Step2',
        api: '/v2.1/accounts/{accountId}/envelopes',
        methodType: 'POST',
        requestBody: '<Request 2 text will be shown here>',
        response: '<Response 2 text will be shown here>',
      },
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('number of rows should be correct', () => {
    const rows = fixture.debugElement.queryAll(By.css('.sheet__body .mat-row'));
    expect(rows).toBeTruthy();
    expect(rows.length).toBe(2);
  });

  it('cells should be correct', () => {
    const tableRows = fixture.nativeElement.querySelectorAll(
      '.sheet__body .mat-row'
    );
    expect(tableRows).toBeTruthy();
    expect(tableRows.length).toBe(2);

    expect(tableRows[0].cells[0].innerHTML).toContain(
      formatDate(new Date(), 'yyyy-MM-dd HH:mm', 'en_US')
    );
    expect(tableRows[0].cells[1].innerHTML).toContain('Scenario1');
    expect(tableRows[0].cells[2].innerHTML).toContain('Step1');
    expect(tableRows[0].cells[3].innerHTML).toContain(
      'POST /v2.1/accounts/{accountId}/envelopes'
    );
    expect(tableRows[0].cells[4].innerHTML).toContain('Request 1 text will');
    expect(tableRows[0].cells[5].innerHTML).toContain(
      'Response 1 text will be'
    );
  });
});
