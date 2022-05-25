import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { AccountService } from 'src/app/services/account-service';
import { AccountServiceStub } from 'src/app/services/account-service.stub';
import { ParametersPromptNotificationService } from '../services/parameters-prompts-notification.service';
import { ScenarioServiceStub } from '../services/scenario-service.stub';
import { ParameterControlComponent } from './parameter-control/parameter-control.component';
import { ParametersPromptComponent } from './parameters-prompt.component';

describe('ParametersPromptsComponent', () => {
  let component: ParametersPromptComponent;
  let fixture: ComponentFixture<ParametersPromptComponent>;
  let scenarioServiceStub: ScenarioServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [ParametersPromptComponent, ParameterControlComponent],
      providers: [
        { provide: AccountService, useClass: AccountServiceStub },
        { provide: FormBuilder, useClass: FormBuilder },
        {
          provide: ParametersPromptNotificationService,
          useClass: ParametersPromptNotificationService,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParametersPromptComponent);
    component = fixture.componentInstance;

    scenarioServiceStub = new ScenarioServiceStub();
    scenarioServiceStub.getScenarioInfo(1).subscribe((x) => {
      component.parameterPrompts = x.parameterPrompts;
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create all controls', () => {
    component.createForm();
    fixture.detectChanges();
    component.ngAfterViewChecked();
    const input = fixture.debugElement.query(By.css('input#signerName'));
    expect(input).toBeTruthy();

    const textArea = fixture.debugElement.query(By.css('textarea#comment'));
    expect(textArea).toBeTruthy();

    const email = fixture.debugElement.query(By.css('input[type="email"]'));
    expect(email).toBeTruthy();

    const file = fixture.debugElement.query(By.css(`input[type="file"]`));
    expect(file).toBeTruthy();

    const select = fixture.debugElement.query(
      By.css(`mat-select#signatureType`)
    );

    expect(select).toBeTruthy();
  });
});
