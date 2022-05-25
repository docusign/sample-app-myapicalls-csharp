import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { IScenario } from '../models/scenario';
import { ScenariosService } from '../services/scenarios.service';
import { FilterScenariosService } from '../services/filter-scenarios.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-scenarios-list',
  templateUrl: './scenarios-list.component.html',
  styleUrls: ['./scenarios-list.component.scss'],
})
export class ScenariosListComponent implements OnInit {
  scenarios: IScenario[] = [];
  scenariosToDisplay: IScenario[] = [];

  pageSize = 5;
  length: number = 0;
  pageSizeOptions: number[] = [5, 10, 50];
  @ViewChild('scenariosPaginator') paginator!: MatPaginator;

  selectedArea: string = '';
  selectedCategory: string = '';
  selectedAreaAmount: number = 0;
  selectedCategoryAmount: number = 0;

  constructor(
    @Inject(ScenariosService) private scenariosService: ScenariosService,
    @Inject(FilterScenariosService)
    private filterSenariosService: FilterScenariosService
  ) {}

  ngOnInit(): void {
    this.scenariosService.getScenarios().subscribe((scenarios) => {
      this.scenarios = scenarios;

      this.filterSenariosService.scenariosList = scenarios;
      this.filterSenariosService.filteredItems.next(scenarios);

      this.length = scenarios.length;
      this.sliceScenarios(this.pageSize, 0);
    });

    this.filterSenariosService.filteredItems.subscribe((scenarios) => {
      this.selectedArea = this.filterSenariosService.selectedArea;
      this.selectedCategory = this.filterSenariosService.selectedCategory;

      if (scenarios !== undefined) {
        this.selectedCategoryAmount = scenarios.filter((scenario) =>
          scenario.categories.includes(this.selectedCategory)
        ).length;

        this.selectedAreaAmount = scenarios.filter((scenario) =>
          scenario.areas.includes(this.selectedArea)
        ).length;
      }

      this.scenarios = scenarios;

      if (this.paginator) {
        this.paginator.firstPage();
      }
      this.length = scenarios.length;
      this.sliceScenarios(this.pageSize, 0);
    });
  }

  pageChanged(event: PageEvent) {
    this.sliceScenarios(event.pageSize, event.pageIndex);
  }

  removeCategoryFilter() {
    this.selectedCategory = '';
    this.filterSenariosService.filterScenariosByCategory(this.selectedCategory);
  }

  removeAreaFilter() {
    this.selectedArea = '';
    this.filterSenariosService.filterScenariosByArea(this.selectedArea);
  }

  removeAllFilters() {
    this.selectedCategory = '';
    this.selectedArea = '';
    this.filterSenariosService.filterScenario(
      this.selectedArea,
      this.selectedCategory
    );
  }

  private sliceScenarios(pageSize: number, pageIndex: number) {
    const start = pageSize * pageIndex;
    const end = start + pageSize;

    this.scenariosToDisplay = this.scenarios.slice(start, end);
  }
}
