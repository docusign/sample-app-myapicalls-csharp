import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ScenariosService } from '../services/scenarios.service';
import { ScenariosServiceStub } from '../services/scenarios.service.stub';
import { FilterScenariosService } from '../services/filter-scenarios.service';
import { AreasFiltersComponent } from './areas-filters.component';
import { TranslateModule } from '@ngx-translate/core';

describe('AreasFiltersComponent', () => {
  let component: AreasFiltersComponent;
  let fixture: ComponentFixture<AreasFiltersComponent>;
  const area = 'Click API';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [AreasFiltersComponent],
      providers: [
        { provide: ScenariosService, useClass: ScenariosServiceStub },
        { provide: FilterScenariosService, useClass: FilterScenariosService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AreasFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show "View more" button', () => {
    component.numberOfFiltersToDefaultDisplay = 1;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button.filter__exp'));
    expect(button).toBeTruthy();
    expect(button.nativeElement.textContent).toContain('FILTER.VIEW_MORE');
  });

  it('should expand filters when toggle filters is called for the 1st time', () => {
    component.numberOfFiltersToDefaultDisplay = 1;
    component.ngOnInit();
    component.toggleFilters();
    fixture.detectChanges();
    const listItems = fixture.debugElement.queryAll(By.css('li.filter__item'));
    expect(listItems.length).toBe(3);
  });

  it('should collapse filters when toggle filters is called for the 2nd time', () => {
    component.numberOfFiltersToDefaultDisplay = 1;
    component.ngOnInit();
    component.toggleFilters();
    fixture.detectChanges();
    component.toggleFilters();
    fixture.detectChanges();
    const listItems = fixture.debugElement.queryAll(By.css('li.filter__item'));
    expect(listItems.length).toBe(1);
  });

  it('should show "View less" button when toggle filters is called for the 1st time', () => {
    component.numberOfFiltersToDefaultDisplay = 1;
    component.ngOnInit();
    component.toggleFilters();
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button.filter__exp'));
    expect(button).toBeTruthy();
    expect(button.nativeElement.textContent).toContain('FILTER.VIEW_LESS');
  });

  it('selectedArea property should be correct after filterByArea() is called for the 1st time', () => {
    component.numberOfFiltersToDefaultDisplay = 3;
    component.ngOnInit();
    component.filterByArea(area);
    expect(component.selectedArea).toBe(area);
  });

  it('selectedArea property should be empty after filterByArea() is called for the 2nd time', () => {
    component.numberOfFiltersToDefaultDisplay = 3;
    component.ngOnInit();
    component.filterByArea(area);
    component.filterByArea(area);
    expect(component.selectedArea).toBe('');
  });

  it('filter should be selected after filterByArea() is called for the 1st time', () => {
    component.numberOfFiltersToDefaultDisplay = 3;
    component.ngOnInit();
    component.filterByArea(area);
    fixture.detectChanges();
    const listItems = fixture.debugElement.queryAll(
      By.css('button.filter__button.selected')
    );
    expect(listItems).toBeTruthy();
    expect(listItems.length).toBe(1);
    expect(listItems[0].nativeElement.textContent).toContain('Click API');
  });

  it('filter should not be selected after filterByArea() is called for the 2nd time', () => {
    component.numberOfFiltersToDefaultDisplay = 3;
    component.ngOnInit();
    component.filterByArea(area);
    fixture.detectChanges();
    component.filterByArea(area);
    fixture.detectChanges();
    const listItems = fixture.debugElement.queryAll(
      By.css('button.filter__button.selected')
    );
    expect(listItems).toBeTruthy();
    expect(listItems.length).toBe(0);
  });
});
