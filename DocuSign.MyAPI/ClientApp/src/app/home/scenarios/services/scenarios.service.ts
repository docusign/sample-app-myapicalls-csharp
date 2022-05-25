import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IScenario } from '../models/scenario';

@Injectable()
export class ScenariosService {
  constructor(private http: HttpClient) {}
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  getScenarios(): Observable<IScenario[]> {
    return this.http.get<IScenario[]>('/api/scenario', this.httpOptions);
  }

  getCategoriesFilters(): Observable<string[]> {
    return this.http.get<string[]>('/api/filter/categories', this.httpOptions);
  }

  getAreasFilters(): Observable<string[]> {
    return this.http.get<string[]>('/api/filter/areas', this.httpOptions);
  }
}
