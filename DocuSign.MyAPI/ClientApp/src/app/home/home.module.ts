import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { HomeRoutingModule } from './home-routing.module';
import { ScenariosListComponent } from './scenarios/scenarios-list/scenarios-list.component';
import { HomeComponent } from './home.component';
import { CategoriesFiltersComponent } from './scenarios/categories-filters/categories-filters.component';
import { AreasFiltersComponent } from './scenarios/areas-filters/areas-filters.component';
import { FilterScenariosService } from './scenarios/services/filter-scenarios.service';
import { HeroComponent } from './hero/hero.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    HomeComponent,
    ScenariosListComponent,
    CategoriesFiltersComponent,
    AreasFiltersComponent,
    HeroComponent,
  ],
  imports: [
    HomeRoutingModule,
    CommonModule,
    MatChipsModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    TranslateModule.forChild(),
  ],
  providers: [
    {
      provide: FilterScenariosService,
      useClass: FilterScenariosService,
    },
  ],
})
export class HomeModule {}
