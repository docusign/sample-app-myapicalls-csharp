import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ScenariosService } from '../services/scenarios.service';
import { ScenariosServiceStub } from '../services/scenarios.service.stub';
import { FilterScenariosService } from '../services/filter-scenarios.service';
import { TranslateModule } from '@ngx-translate/core';
import { CategoriesFiltersComponent } from './categories-filters.component';

describe('CategoriesFiltersComponent', () => {
  let component: CategoriesFiltersComponent;
  let fixture: ComponentFixture<CategoriesFiltersComponent>;
  const category = 'Templates';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [CategoriesFiltersComponent],
      providers: [
        { provide: ScenariosService, useClass: ScenariosServiceStub },
        { provide: FilterScenariosService, useClass: FilterScenariosService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoriesFiltersComponent);
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
    expect(listItems.length).toBe(2);
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

  it('selectedCategory property should be correct after filterByCategory() is called for the 1st time', () => {
    component.numberOfFiltersToDefaultDisplay = 2;
    component.ngOnInit();
    component.filterByCategory(category);
    expect(component.selectedCategory).toBe(category);
  });

  it('selectedCategory property should be empty after filterByCategory() is called for the 2nd time', () => {
    component.numberOfFiltersToDefaultDisplay = 2;
    component.ngOnInit();
    component.filterByCategory(category);
    component.filterByCategory(category);
    expect(component.selectedCategory).toBe('');
  });

  it('filter should be selected after filterByCategory() is called for the 1st time', () => {
    component.numberOfFiltersToDefaultDisplay = 2;
    component.ngOnInit();
    component.filterByCategory(category);
    fixture.detectChanges();
    const listItems = fixture.debugElement.queryAll(
      By.css('button.filter__button.selected')
    );
    expect(listItems).toBeTruthy();
    expect(listItems.length).toBe(1);
    expect(listItems[0].nativeElement.textContent).toContain(category);
  });

  it('filter should not be selected after filterByCategory() is called for the 2nd time', () => {
    component.numberOfFiltersToDefaultDisplay = 2;
    component.ngOnInit();
    component.filterByCategory(category);
    fixture.detectChanges();
    component.filterByCategory(category);
    fixture.detectChanges();
    const listItems = fixture.debugElement.queryAll(
      By.css('button.filter__button.selected')
    );
    expect(listItems).toBeTruthy();
    expect(listItems.length).toBe(0);
  });
});
