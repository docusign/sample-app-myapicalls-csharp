import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IScenario } from '../models/scenario';

@Injectable()
export class ScenariosServiceStub {
  constructor() {}

  getScenarios(): Observable<IScenario[]> {
    return of([
      <IScenario>{
        scenarioNumber: 1,
        name: 'Scenario 1',
        title: 'Scenario title 1',
        shortDescription: 'Scenario description 1',
        codeFlow: 'Home description 1',
        description: ` Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur.`,
        categories: ['eSingature', 'Click'],
        areas: ['eSingature', 'Click'],
      },
      <IScenario>{
        scenarioNumber: 2,
        name: 'Scenario 2',
        title: 'Scenario title 2',
        shortDescription: 'Scenario description 2',
        codeFlow: 'Home description 2',
        description: ` Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur.`,
        categories: ['eSingature', 'Click'],
        areas: ['eSingature', 'Click'],
      },
      <IScenario>{
        scenarioNumber: 3,
        name: 'Scenario 3',
        title: 'Scenario title 3',
        shortDescription: 'Scenario description 3',
        codeFlow: 'Home description 3',
        description: ` Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur.`,
        categories: ['eSingature', 'Click'],
        areas: ['eSingature', 'Click'],
      },
    ]);
  }

  getCategoriesFilters(): Observable<string[]> {
    return of(['Envelopes', 'Templates']);
  }

  getAreasFilters(): Observable<string[]> {
    return of(['Admin API', 'Click API', 'E-Signature REST API']);
  }
}
