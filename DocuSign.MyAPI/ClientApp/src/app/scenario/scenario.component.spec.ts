import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { MatStepperModule } from '@angular/material/stepper';
import {
  MatStepperHarness,
  MatStepHarness,
} from '@angular/material/stepper/testing';
import { ActivatedRoute } from '@angular/router';
import { ScenarioService } from './services/scenario-service';
import { ScenarioServiceStub } from './services/scenario-service.stub';
import { ScenarioComponent } from './scenario.component';
import { ExecutionResultService } from './services/execution-result.service';
import { AccountService } from './../services/account-service';
import { AccountServiceStub } from './../services/account-service.stub';
import { TranslateModule } from '@ngx-translate/core';

describe('ScenarioComponent', () => {
  let component: ScenarioComponent;
  let fixture: ComponentFixture<ScenarioComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatStepperModule,
        TranslateModule.forRoot(),
      ],
      declarations: [ScenarioComponent],
      providers: [
        { provide: ScenarioService, useClass: ScenarioServiceStub },
        {
          provide: ActivatedRoute,
          useValue: { params: of([{ id: 1 }]) },
        },
        { provide: ExecutionResultService, useClass: ExecutionResultService },
        { provide: AccountService, useClass: AccountServiceStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScenarioComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('number of steps should be correct', async () => {
    const stepper = await loader.getHarness(MatStepperHarness);
    expect(stepper).toBeTruthy();
    expect((await stepper.getSteps()).length).toBe(3);
  });

  it('1st step should have correct label', async () => {
    const steps = await loader.getAllHarnesses(MatStepHarness);

    expect((await steps[0].getLabel()).toString()).toContain(
      'EXECUTE.SCENARIO.TITLE'
    );
    expect((await steps[0].getLabel()).toString()).toContain(
      'EXECUTE.SCENARIO.DESCRIPTION'
    );
  });

  it('2nd step should have correct label', async () => {
    const steps = await loader.getAllHarnesses(MatStepHarness);

    expect((await steps[1].getLabel()).toString()).toContain(
      'Step short description 1'
    );
    expect((await steps[1].getLabel()).toString()).toContain('Step title 1');
  });

  it('3rd step should have correct label', async () => {
    const steps = await loader.getAllHarnesses(MatStepHarness);

    expect((await steps[2].getLabel()).toString()).toContain(
      'Step short description 2'
    );
    expect((await steps[2].getLabel()).toString()).toContain('Step title 2');
  });

  it(' should have result wrapper', () => {
    component.isResultsVisible = true;
    fixture.detectChanges();

    const wrapper = fixture.debugElement.query(
      By.css('.sheet__wrapper')
    ).nativeElement;

    expect(wrapper).toBeTruthy();
  });

  it(' should not have result wrapper', () => {
    const wrapper = fixture.debugElement.query(By.css('.sheet__wrapper'));

    expect(wrapper).toBeFalsy();
  });
});
