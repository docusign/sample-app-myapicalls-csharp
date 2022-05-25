import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IScenario } from '../models/scenario';

@Injectable()
export class FilterScenariosService {
  constructor() {}

  selectedArea: string = '';
  selectedCategory: string = '';
  scenariosList: IScenario[] = [];
  filteredItems = new BehaviorSubject(this.scenariosList);

  filterScenariosByArea(area: string) {
    this.selectedArea = area;

    this.filterScenario(this.selectedArea, this.selectedCategory);
  }

  filterScenariosByCategory(category: string) {
    this.selectedCategory = category;

    this.filterScenario(this.selectedArea, this.selectedCategory);
  }

  filterScenario(area: string, category: string) {
    this.selectedArea = area;
    this.selectedCategory = category;

    if (area === '') {
      if (category === '') {
        this.filteredItems.next(this.scenariosList);
      } else {
        this.filteredItems.next(
          this.scenariosList.filter((scenario) =>
            scenario.categories.includes(category)
          )
        );
      }
    } else {
      if (category === '') {
        this.filteredItems.next(
          this.scenariosList.filter((scenario) => scenario.areas.includes(area))
        );
      } else {
        this.filteredItems.next(
          this.scenariosList.filter(
            (scenario) =>
              scenario.categories.includes(category) &&
              scenario.areas.includes(area)
          )
        );
      }
    }
  }
}
