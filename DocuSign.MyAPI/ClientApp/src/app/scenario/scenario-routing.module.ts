import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScenarioComponent } from './scenario.component';

const routes: Routes = [{ path: ':id', component: ScenarioComponent }];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScenarioRoutingModule {}
