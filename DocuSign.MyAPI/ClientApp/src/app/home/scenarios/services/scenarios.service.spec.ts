import { TestBed } from '@angular/core/testing';

import { ScenariosService } from './scenarios.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('ScenariosService', () => {
  let service: ScenariosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: ScenariosService, useClass: ScenariosService }],
    });
    service = TestBed.inject(ScenariosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
