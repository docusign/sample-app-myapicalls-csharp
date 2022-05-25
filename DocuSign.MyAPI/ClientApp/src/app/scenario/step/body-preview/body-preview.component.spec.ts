import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BodyPreviewComponent } from './body-preview.component';

describe('BodyPreviewComponent', () => {
  let component: BodyPreviewComponent;
  let fixture: ComponentFixture<BodyPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BodyPreviewComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BodyPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('body should be displayed', () => {
    component.body = 'Request body';
    fixture.detectChanges();

    const text = fixture.debugElement.query(
      By.css('.output__code-inner code')
    ).nativeElement;
    expect(text).toBeTruthy();
    expect(text.innerText).toContain('Request body');
  });
});
