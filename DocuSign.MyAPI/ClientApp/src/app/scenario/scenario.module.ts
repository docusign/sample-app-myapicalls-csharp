import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioComponent } from './scenario.component';
import { ScenarioRoutingModule } from './scenario-routing.module';

import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { ParametersPromptComponent } from './parameters-prompt/parameters-prompt.component';
import { environment } from 'src/environments/environment';
import { ParameterControlComponent } from './parameters-prompt/parameter-control/parameter-control.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { ExecuteScenarioComponent } from './execute-scenario/execute-scenario.component';
import { StepComponent } from './step/step.component';
import { ScenarioService } from './services/scenario-service';
import { ScenarioServiceStub } from './services/scenario-service.stub';
import { LoginPromptComponent } from './login-prompt/login-prompt.component';
import { ExecutionResultService } from './services/execution-result.service';
import { ExecutionResultsComponent } from './execution-results/execution-results.component';
import { BodyPreviewComponent } from './step/body-preview/body-preview.component';
import { FileService } from './services/file.service';
import { ParametersPromptNotificationService } from './services/parameters-prompts-notification.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { DirectivesModule } from '../directives/directives.module';

@NgModule({
  declarations: [
    ScenarioComponent,
    ParametersPromptComponent,
    ParameterControlComponent,
    ScenarioComponent,
    ExecuteScenarioComponent,
    StepComponent,
    LoginPromptComponent,
    ExecutionResultsComponent,
    BodyPreviewComponent,
  ],
  imports: [
    CommonModule,
    ScenarioRoutingModule,
    MatButtonModule,
    MatStepperModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatTableModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatExpansionModule,
    TranslateModule.forChild(),
    FormsModule,
    DirectivesModule,
  ],
  providers: [
    {
      provide: ScenarioService,
      useClass:
        environment.stubBackend == true ? ScenarioServiceStub : ScenarioService,
    },
    {
      provide: ExecutionResultService,
      useClass: ExecutionResultService,
    },
    {
      provide: FileService,
      useClass: FileService,
    },
    {
      provide: ParametersPromptNotificationService,
      useClass: ParametersPromptNotificationService,
    },
  ],
})
export class ScenarioModule {}
