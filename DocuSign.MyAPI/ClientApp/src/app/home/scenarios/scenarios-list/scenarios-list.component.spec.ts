import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScenariosListComponent } from './scenarios-list.component';
import { MatExpansionPanelHarness } from '@angular/material/expansion/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ScenariosService } from '../services/scenarios.service';
import { ScenariosServiceStub } from '../services/scenarios.service.stub';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FilterScenariosService } from '../services/filter-scenarios.service';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';

describe('ScenariosListComponent', () => {
  let component: ScenariosListComponent;
  let fixture: ComponentFixture<ScenariosListComponent>;

  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatExpansionModule,
        NoopAnimationsModule,
        MatPaginatorModule,
        TranslateModule.forRoot(),
      ],
      declarations: [ScenariosListComponent],
      providers: [
        { provide: ScenariosService, useClass: ScenariosServiceStub },
        { provide: FilterScenariosService, useClass: FilterScenariosService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ScenariosListComponent);
    fixture.componentInstance.pageSize = 2;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('number of scenarios panels should be correct on 1st page', async () => {
    const panels = await loader.getAllHarnesses(MatExpansionPanelHarness);
    expect(panels.length).toBe(2);
  });

  it('first scenario panel should have correct title', async () => {
    const panels = await loader.getAllHarnesses(MatExpansionPanelHarness);
    expect(await panels[0].getTitle()).toBe('Scenario title 1');
  });

  it('second scenario panel should have correct title', async () => {
    const panels = await loader.getAllHarnesses(MatExpansionPanelHarness);
    expect(await panels[1].getTitle()).toBe('Scenario title 2');
  });

  it('first scenario panel should have correct description', async () => {
    const panels = await loader.getAllHarnesses(MatExpansionPanelHarness);
    expect(await panels[0].getDescription()).toBe('Scenario description 1');
  });

  it('second scenario panel should have correct description', async () => {
    const panels = await loader.getAllHarnesses(MatExpansionPanelHarness);
    expect(await panels[1].getDescription()).toBe('Scenario description 2');
  });

  it('first scenario panel should have correct content', async () => {
    const panels = await loader.getAllHarnesses(MatExpansionPanelHarness);
    expect((await panels[0].getTextContent()).toString()).toContain(
      `eSingatureClick Lorem ipsum dolor sit amet,`
    );
  });

  it('second scenario panel should have correct content', async () => {
    const panels = await loader.getAllHarnesses(MatExpansionPanelHarness);
    expect(await panels[1].getTextContent()).toContain(
      `eSingatureClick Lorem ipsum dolor sit amet,`
    );
  });

  it('paginator PageSize should be correct', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);
    expect(await paginator.getPageSize()).toBe(component.pageSize);
  });

  it('paginator label should be correct on 1st page', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);
    expect(await paginator.getRangeLabel()).toBe('1 – 2 of 3');
  });

  it('paginator label should be correct on 2nd page', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);
    await paginator.goToNextPage();
    expect(await paginator.getRangeLabel()).toBe('3 – 3 of 3');
  });

  it('number of scenarios panels should be correct on 2nd page', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);
    await paginator.goToNextPage();

    const panels = await loader.getAllHarnesses(MatExpansionPanelHarness);
    expect(panels.length).toBe(1);
  });

  it('first scenario panel on 2nd page should have correct title', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);
    await paginator.goToNextPage();

    const panels = await loader.getAllHarnesses(MatExpansionPanelHarness);
    expect(await panels[0].getTitle()).toBe('Scenario title 3');
  });

  it('first scenario panel on 2nd page should have correct description', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);
    await paginator.goToNextPage();

    const panels = await loader.getAllHarnesses(MatExpansionPanelHarness);
    expect(await panels[0].getDescription()).toBe('Scenario description 3');
  });

  it('first scenario panel on 2nd page should have correct content', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);
    await paginator.goToNextPage();

    const panels = await loader.getAllHarnesses(MatExpansionPanelHarness);
    expect((await panels[0].getTextContent()).toString()).toContain(
      `eSingatureClick Lorem ipsum dolor sit amet,`
    );
  });
});
