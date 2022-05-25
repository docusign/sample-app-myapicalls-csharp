import { Component, Inject, OnInit } from '@angular/core';
import { ScenariosService } from '../services/scenarios.service';
import { FilterScenariosService } from '../services/filter-scenarios.service';

@Component({
  selector: 'app-areas-filters',
  templateUrl: './areas-filters.component.html',
  styleUrls: ['./areas-filters.component.scss'],
})
export class AreasFiltersComponent implements OnInit {
  numberOfFiltersToDefaultDisplay = 2;
  private areasList: string[] = [];
  private areasFilters: { name: string; amount: number }[] = [];
  areasFiltersToDisplay: { name: string; amount: number }[] = [];
  selectedArea: string = '';
  isExpanded: boolean = false;

  constructor(
    @Inject(ScenariosService) private scenariosService: ScenariosService,
    @Inject(FilterScenariosService)
    private filterSenariosService: FilterScenariosService
  ) {}

  ngOnInit(): void {
    this.scenariosService.getAreasFilters().subscribe((areasFilters) => {
      this.areasList = areasFilters;

      this.filterSenariosService.filteredItems.subscribe((scenarios) => {
        this.selectedArea = this.filterSenariosService.selectedArea;
        this.areasFilters = [];
        this.areasList.forEach((area) => {
          const filtered = scenarios.filter((scenario) =>
            scenario.areas?.includes(area)
          );

          this.areasFilters.push({ name: area, amount: filtered.length });
        });

        if (this.isExpanded) {
          this.areasFiltersToDisplay = this.areasFilters;
        } else {
          this.areasFiltersToDisplay = this.reduceFilters();
        }
      });
    });
  }

  toggleFilters() {
    if (this.areasFiltersToDisplay.length < this.areasFilters.length) {
      this.areasFiltersToDisplay = this.areasFilters;
      this.isExpanded = true;
    } else {
      this.areasFiltersToDisplay = this.reduceFilters();
      this.isExpanded = false;
    }
  }

  reduceFilters(): { name: string; amount: number }[] {
    return this.areasFilters.slice(0, this.numberOfFiltersToDefaultDisplay);
  }

  get showSeeMoreButton(): boolean {
    return this.areasFilters.length > this.numberOfFiltersToDefaultDisplay;
  }

  filterByArea(value: string) {
    if (this.selectedArea === value) {
      this.selectedArea = '';
    } else {
      this.selectedArea = value;
    }

    this.filterSenariosService.filterScenariosByArea(this.selectedArea);
  }

  isAreaSelected(tag: string): boolean {
    return tag === this.selectedArea;
  }
}
