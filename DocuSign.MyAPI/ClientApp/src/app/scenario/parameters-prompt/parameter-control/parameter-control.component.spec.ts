import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IParameterPrompt } from '../../models/parameter-prompt';
import { ParameterPromptType } from '../../models/parameter-prompt-type';
import { ParameterControlComponent } from './parameter-control.component';
import { ParametersPromptNotificationService } from '../../services/parameters-prompts-notification.service';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

describe('ParameterControlComponent', () => {
  let component: ParameterControlComponent;
  let fixture: ComponentFixture<ParameterControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [ParameterControlComponent],
      providers: [
        {
          provide: ParametersPromptNotificationService,
          useClass: ParametersPromptNotificationService,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterControlComponent);
    component = fixture.componentInstance;
    component.parameter = <IParameterPrompt>{
      name: 'signerEmail',
      title: 'Signer Email',
      type: ParameterPromptType.email,
      note: 'Email where document for signing will be sent',
      required: true,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build input', () => {
    component.parameter = <IParameterPrompt>{
      stepName: 'Step1',
      name: 'signerName',
      defaultValue: '',
      title: 'Signer Name',
      type: ParameterPromptType.string,
      requestParameterType: 'asasdasd',
      requestParameterPath: 'cczxczxc',
      note: 'Name of the signer',
      required: false,
      options: undefined,
    };

    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input#signerName'));
    expect(input).toBeTruthy();
  });

  it('should build textarea', () => {
    component.parameter = <IParameterPrompt>{
      stepName: 'Step1',
      name: 'comment',
      defaultValue: '',
      title: 'Comment',
      type: ParameterPromptType.text,
      requestParameterType: 'asasdasd',
      requestParameterPath: 'cczxczxc',
      note: 'Comment input',
      required: false,
      options: undefined,
    };

    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('textarea#comment'));
    expect(input).toBeTruthy();
  });

  it('should build input type "email"', () => {
    component.parameter = <IParameterPrompt>{
      stepName: 'Step1',
      name: 'email',
      defaultValue: '',
      title: 'Email',
      type: ParameterPromptType.email,
      requestParameterType: 'asasdasd',
      requestParameterPath: 'cczxczxc',
      note: 'Email',
      required: false,
      options: undefined,
    };

    fixture.detectChanges();
    const input = fixture.debugElement.query(
      By.css('input[type="email"]#email')
    );
    expect(input).toBeTruthy();
  });

  it('should build input type "file"', () => {
    component.parameter = <IParameterPrompt>{
      stepName: 'Step1',
      name: 'document',
      defaultValue: '',
      title: 'document',
      type: ParameterPromptType.file,
      requestParameterType: 'asasdasd',
      requestParameterPath: 'cczxczxc',
      note: 'document',
      required: false,
      options: undefined,
    };
    component.identifier = 'A' + component.identifier;
    fixture.detectChanges();
    const input = fixture.debugElement.query(
      By.css(`input[type="file"]#${component.identifier.toString()}`)
    );

    expect(input).toBeTruthy();
  });

  it('should build input type "mat-select"', () => {
    component.parameter = <IParameterPrompt>{
      stepName: 'Step2',
      name: 'signatureType',
      title: 'Signature Type',
      type: ParameterPromptType.select,
      note: 'Signature type',
      required: true,
      options: [
        {
          key: 'Simple',
          value: 'Simple Signature',
        },
        {
          key: 'AES',
          value: 'Advanced signature',
        },
        {
          key: 'QES',
          value: 'Qualified signature',
        },
      ],
    };
    fixture.detectChanges();
    const input = fixture.debugElement.query(
      By.css(`mat-select#signatureType`)
    );

    expect(input).toBeTruthy();
  });
});
