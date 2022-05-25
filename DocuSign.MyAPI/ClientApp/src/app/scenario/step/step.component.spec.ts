import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScenarioService } from '../services/scenario-service';
import { ScenarioServiceStub } from '../services/scenario-service.stub';
import { StepComponent } from './step.component';
import { IScenarioStep } from '../models/scenario-step';
import { By } from '@angular/platform-browser';
import { AccountService } from '../../services/account-service';
import { AccountServiceStub } from '../../services/account-service.stub';
import { ExecutionResultService } from '../services/execution-result.service';
import { ParametersPromptNotificationService } from '../services/parameters-prompts-notification.service';
import { TranslateModule } from '@ngx-translate/core';
import { LocalStorageService } from '../../services/local-storage.service';
import { LocalStorageServiceStub } from '../../services/local-storage.service.stub';

describe('StepComponent', () => {
  let component: StepComponent;
  let fixture: ComponentFixture<StepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [StepComponent],
      providers: [
        { provide: ScenarioService, useClass: ScenarioServiceStub },
        { provide: AccountService, useClass: AccountServiceStub },
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
    fixture = TestBed.createComponent(StepComponent);
    component = fixture.componentInstance;
    component.step = <IScenarioStep>{
      name: 'Step 1',
      title: '',
    };
    component.scenarioId = 1;

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
    expect(title.innerText).toBe('Step title 1');
  });

  it('should have correct description', () => {
    const description = fixture.debugElement.query(
      By.css('.execution__input .text p')
    ).nativeElement;

    expect(description).toBeTruthy();
    expect(description.innerText).toContain('Lorem ipsum dolor sit amet,');
  });

  it('should have correct method', () => {
    const method = fixture.debugElement.query(
      By.css('.execution__input .endpoint .label__primary')
    ).nativeElement;

    expect(method).toBeTruthy();
    expect(method.innerText).toContain('POST');
  });

  it('should have correct api', () => {
    const api = fixture.debugElement.query(
      By.css('.execution__input .endpoint strong')
    ).nativeElement;

    expect(api).toBeTruthy();
    expect(api.innerText).toContain('/v2.1/accounts/{accountId}/envelopes');
  });

  it('should have correct url', () => {
    const url = <HTMLAnchorElement>(
      fixture.debugElement.query(By.css('.execution__input .url a'))
        .nativeElement
    );

    expect(url).toBeTruthy();
    expect(url.href).toBe('http://some.url/');
  });

  it('login prompt should be present', () => {
    const login =
      fixture.debugElement.nativeElement.querySelector('app-login-prompt');

    expect(login).toBeTruthy();
  });
});
