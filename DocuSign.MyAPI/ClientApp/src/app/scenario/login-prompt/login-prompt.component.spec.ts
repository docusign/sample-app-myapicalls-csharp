import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPromptComponent } from './login-prompt.component';
import { AccountService } from '../../services/account-service';
import { AccountServiceStub } from '../../services/account-service.stub';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

describe('LoginPromptComponent', () => {
  let component: LoginPromptComponent;
  let fixture: ComponentFixture<LoginPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [LoginPromptComponent],
      providers: [
        { provide: AccountService, useClass: AccountServiceStub },
        { provide: Router, useValue: { url: '/' } },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
