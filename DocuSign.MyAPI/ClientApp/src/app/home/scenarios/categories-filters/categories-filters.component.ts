import { Component, Inject, OnInit } from '@angular/core';
import { ScenariosService } from '../services/scenarios.service';
import { FilterScenariosService } from '../services/filter-scenarios.service';

@Component({
  selector: 'app-categories-filters',
  templateUrl: './categories-filters.component.html',
  styleUrls: ['./categories-filters.component.scss'],
})
export class CategoriesFiltersComponent implements OnInit {
  numberOfFiltersToDefaultDisplay = 2;
  private categoriesList: string[] = [];
  private categoriesFilters: { name: string; amount: number }[] = [];
  categoriesFiltersToDisplay: { name: string; amount: number }[] = [];
  selectedCategory: string = '';
  isExpanded: boolean = false;

  constructor(
    @Inject(ScenariosService) private scenariosService: ScenariosService,
    @Inject(FilterScenariosService)
    private filterSenariosService: FilterScenariosService
  ) {}

  ngOnInit(): void {
    this.scenariosService
      .getCategoriesFilters()
      .subscribe((categoriesFilters) => {
        this.categoriesList = categoriesFilters;

        this.filterSenariosService.filteredItems.subscribe((scenarios) => {
          this.selectedCategory = this.filterSenariosService.selectedCategory;
          this.categoriesFilters = [];
          this.categoriesList.forEach((category) => {
            const filtered = scenarios.filter((scenario) =>
              scenario.categories.includes(category)
            );

            this.categoriesFilters.push({
              name: category,
              amount: filtered.length,
            });
          });

          if (this.isExpanded) {
            this.categoriesFiltersToDisplay = this.categoriesFilters;
          } else {
            this.categoriesFiltersToDisplay = this.reduceFilters();
          }
        });
      });
  }

  toggleFilters() {
    if (
      this.categoriesFiltersToDisplay.length < this.categoriesFilters.length
    ) {
      this.categoriesFiltersToDisplay = this.categoriesFilters;
      this.isExpanded = true;
    } else {
      this.categoriesFiltersToDisplay = this.reduceFilters();
      this.isExpanded = false;
    }
  }

  reduceFilters(): { name: string; amount: number }[] {
    return this.categoriesFilters.slice(
      0,
      this.numberOfFiltersToDefaultDisplay
    );
  }

  get showSeeMoreButton(): boolean {
    return this.categoriesFilters.length > this.numberOfFiltersToDefaultDisplay;
  }

  filterByCategory(value: string) {
    if (this.selectedCategory === value) {
      this.selectedCategory = '';
    } else {
      this.selectedCategory = value;
    }

    this.filterSenariosService.filterScenariosByCategory(this.selectedCategory);
  }

  isCategorySelected(tag: string): boolean {
    return tag === this.selectedCategory;
  }
}
