import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExecuteScenarioComponent } from './execute-scenario.component';
import { IScenarioInfo } from '../models/scenario-info';
import { By } from '@angular/platform-browser';
import { AccountService } from '../../services/account-service';
import { AccountServiceStub } from '../../services/account-service.stub';
import { ScenarioService } from '../services/scenario-service';
import { ScenarioServiceStub } from '../services/scenario-service.stub';
import { ExecutionResultService } from '../services/execution-result.service';
import { ParametersPromptNotificationService } from '../services/parameters-prompts-notification.service';
import { TranslateModule } from '@ngx-translate/core';
import { LocalStorageServiceStub } from '../../services/local-storage.service.stub';
import { LocalStorageService } from '../../services/local-storage.service';

describe('ExecuteScenarioComponent', () => {
  let component: ExecuteScenarioComponent;
  let fixture: ComponentFixture<ExecuteScenarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [ExecuteScenarioComponent],
      providers: [
        { provide: AccountService, useClass: AccountServiceStub },
        { provide: ScenarioService, useClass: ScenarioServiceStub },
        { provide: ExecutionResultService, useClass: ExecutionResultService },
        { provide: LocalStorageService, useClass: LocalStorageServiceStub },
        {
          provide: ParametersPromptNotificationService,
          useClass: ParametersPromptNotificationService,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecuteScenarioComponent);
    component = fixture.componentInstance;
    component.scenario = <IScenarioInfo>{
      name: 'Scenario 1',
      title: 'Scenario title 1',
      sampleFeatures: "Sample features 1",
      codeFlow: 'Home description 1',
      description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur.`,
      shortDescription: '',
      steps: [],
      parameterPrompts: [],
      scenarioNumber: 0,
      completed: false,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct title', () => {
    const title = <HTMLHeadingElement>(
      fixture.debugElement.query(By.css('.execution__input .text h1'))
        .nativeElement
    );

    expect(title).toBeTruthy();
    expect(title.innerText).toBe('Scenario title 1');
  });

  it('should have correct description', () => {
    const description = fixture.debugElement.query(
      By.css('.execution__input .text p')
    ).nativeElement;

    expect(description).toBeTruthy();
    expect(description.innerText).toContain('Lorem ipsum dolor sit amet,');
  });

  it('login prompt should be present', () => {
    const login =
      fixture.debugElement.nativeElement.querySelector('app-login-prompt');

    expect(login).toBeTruthy();
  });

  it('login prompt should not be present', () => {
    const service = TestBed.inject(AccountService);
    service.accountId = 'id';
    fixture.detectChanges();

    const login =
      fixture.debugElement.nativeElement.querySelector('app-login-prompt');

    expect(login).toBeFalsy();
  });
});
