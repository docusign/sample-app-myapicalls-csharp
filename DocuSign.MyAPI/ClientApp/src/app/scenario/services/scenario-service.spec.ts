import { TestBed } from '@angular/core/testing';

import { ScenarioService } from '../services/scenario-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('ScenariosService', () => {
  let service: ScenarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: ScenarioService, useClass: ScenarioService }],
    });
    service = TestBed.inject(ScenarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
