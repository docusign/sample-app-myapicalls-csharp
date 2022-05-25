import { TestBed } from '@angular/core/testing';
import { FilterScenariosService } from './filter-scenarios.service';
import { IScenario } from '../models/scenario';

describe('FilterScenariosService', () => {
  let service: FilterScenariosService;

  const scenarios = [
    <IScenario>{
      name: 'name',
      title: 'title',
      shortDescription: '',
      codeFlow: '',
      description: '',
      categories: ['cat1'],
      areas: ['area1'],
    },
    <IScenario>{
      name: 'name2',
      title: 'title2',
      shortDescription: '',
      codeFlow: '',
      description: '',
      categories: ['cat2'],
      areas: ['area2'],
    },
    <IScenario>{
      name: 'name3',
      title: 'title3',
      shortDescription: '',
      codeFlow: '',
      description: '',
      categories: ['cat1'],
      areas: ['area2'],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: FilterScenariosService, useClass: FilterScenariosService },
      ],
    });
    service = TestBed.inject(FilterScenariosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('scnarios list should be empty after creation', () => {
    expect(service.scenariosList.length).toBe(0);
  });

  it('filtered list should be empty after creation', () => {
    expect(service.filteredItems.getValue().length).toBe(0);
  });

  it('selected area parameter should be correct', () => {
    const area = 'testArea';

    service.filterScenariosByArea(area);
    expect(service.selectedArea).toBe(area);
  });

  it('selected category parameter should be correct', () => {
    const category = 'testCategory';

    service.filterScenariosByCategory(category);
    expect(service.selectedCategory).toBe(category);
  });

  it('filtered list should be correct after call next()', () => {
    service.filteredItems.next(scenarios);

    const result = service.filteredItems.getValue();
    expect(result.length).toBe(3);
    expect(result[0].name).toBe('name');
    expect(result[1].name).toBe('name2');
    expect(result[2].name).toBe('name3');
  });

  it('filtered list should be correct after call filterScenariosByArea()', () => {
    service.scenariosList = scenarios;
    service.filterScenariosByArea('area1');

    const result = service.filteredItems.getValue();
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('name');
  });

  it('filtered list should be correct after call filterScenariosByCategory()', () => {
    service.scenariosList = scenarios;
    service.filterScenariosByCategory('cat1');

    const result = service.filteredItems.getValue();
    expect(result.length).toBe(2);
    expect(result[0].name).toBe('name');
    expect(result[1].name).toBe('name3');
  });

  it('filtered list should be correct after call filterScenariosByArea() and filterScenariosByCategory()', () => {
    service.scenariosList = scenarios;
    service.filterScenariosByCategory('cat1');
    service.filterScenariosByArea('area2');

    const result = service.filteredItems.getValue();
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('name3');
  });
});
