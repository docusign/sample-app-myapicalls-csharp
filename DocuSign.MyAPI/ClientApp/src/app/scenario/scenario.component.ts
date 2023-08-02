import {
  Component,
  OnInit,
  Inject,
  ChangeDetectorRef,
  AfterViewChecked,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScenarioService } from './services/scenario-service';
import { IScenarioInfo } from './models/scenario-info';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { AccountService } from './../services/account-service';
import { MatStepper } from '@angular/material/stepper';
import { IScenarioStep } from './models/scenario-step';

@Component({
  selector: 'app-scenario',
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.scss'],
})
export class ScenarioComponent implements OnInit, AfterViewChecked {
  scenario: IScenarioInfo = {
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
  scenarioId!: number;
  isResultsShown = false;
  isResultsVisible = false;

  constructor(
    @Inject(ScenarioService) private scenariosService: ScenarioService,
    private route: ActivatedRoute,
    @Inject(AccountService) private accountService: AccountService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.scenarioId = Number(params['id']);

      this.scenariosService
        .getScenarioInfo(this.scenarioId)
        .subscribe((scenario) => {
          scenario.steps[scenario.steps.length - 1].last = true;

          this.scenario = scenario;
          this.scenario.scenarioNumber = this.scenarioId;
        });
    });

    this.accountService.isLoggedIn().subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.isResultsVisible = true;
      }
    });
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  stepChanged(event: StepperSelectionEvent) {
    if (
      (event.previouslySelectedIndex > event.selectedIndex ||
        event.previouslySelectedIndex == 0) &&
      !event.previouslySelectedStep.completed
    ) {
      event.previouslySelectedStep.interacted = false;
    }
  }

  toggleResults(): void {
    this.isResultsShown = !this.isResultsShown;
  }

  onExecuteEvent = (arg: boolean): void => {
    this.isResultsShown = arg;
  };

  navigateToStep = (stepper: MatStepper, stepNumber: number): void => {
    stepper.selectedIndex = stepNumber;
  }

  isStepDisabled = (steps: IScenarioStep[], stepNumber: number): boolean => {
    const firstUncompletedStep = steps.findIndex((step) => !step.completed);

    return firstUncompletedStep !== -1 && firstUncompletedStep <= stepNumber;
  }
}
