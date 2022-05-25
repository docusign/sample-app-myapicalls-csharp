import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ParameterPromptType } from '../../models/parameter-prompt-type';
import {
  IParameterPrompt,
  IParameterValue,
} from '../../models/parameter-prompt';
import { ParametersPromptNotificationService } from '../../services/parameters-prompts-notification.service';
import { AppSettings } from '../../../app.settings';

@Component({
  selector: 'app-parameter-control',
  templateUrl: './parameter-control.component.html',
  styleUrls: ['./parameter-control.component.scss'],
})
export class ParameterControlComponent implements OnInit {
  public ParameterPromptType = ParameterPromptType;
  @Input() parameter!: IParameterPrompt;
  @Input() form!: FormGroup;
  options: { key: string; value: unknown }[] = [];
  identifier: string = '';
  fileName: string | undefined;
  fileValue: string = '';
  fileSizeError = 'fileSizeError';

  constructor(
    @Inject(ParametersPromptNotificationService)
    private parametersPromptNotificationService: ParametersPromptNotificationService
  ) {}

  get control() {
    return this.form?.get(this.parameter.name);
  }

  getRandomId(): string {
    var result = '';
    for (let index = 0; index < 5; index++) {
      result += Math.floor(Math.random() * 10);
    }

    return result;
  }

  ngOnInit(): void {
    this.identifier = this.getRandomId();

    if (
      this.parameter.options !== undefined &&
      this.parameter.options !== null
    ) {
      Object.entries(this.parameter.options).map((value) => {
        this.options.push({ key: value[0], value: value[1] });
      });
    }

    if (this.parameter.type == ParameterPromptType.file) {
      this.form.addControl(
        this.parameter.name + '_base64',
        new FormControl(this.parameter.name + '_base64')
      );
    } else {
      this.control?.valueChanges.subscribe((data) => {
        this.parametersPromptNotificationService.notifyChange(<IParameterValue>{
          parameter: this.parameter,
          value: data,
        });
      });

      this.parametersPromptNotificationService.parameter$.subscribe((data) => {
        if (data.parameter?.name == this.parameter.name) {
          this.control?.setValue(data.value, {
            onlySelf: true,
            emitEvent: false,
          });
        }
      });
    }
  }

  notifyChange() {
    this.parametersPromptNotificationService.notifyChange(<IParameterValue>{
      parameter: this.parameter,
      value:
        this.parameter.type == ParameterPromptType.file
          ? this.fileValue
          : this.control?.value,
    });
  }

  handleFileInput(target: EventTarget | null) {
    let file = (<HTMLInputElement>target).files?.item(0);
    if (file) {
      if (file.size > AppSettings.FILE_MAX_SIZE) {
        this.control?.setErrors({ fileSizeError: { value: file.size } });
        this.fileName = '';
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.fileName = file?.name;

        const base64string = reader.result?.toString().split(';base64,')[1];
        this.form.patchValue({
          [this.parameter.name + '_base64']: base64string,
        });

        this.fileValue =
          base64string?.substring(0, 50) +
          '...;' +
          file?.name.split('.')[0] +
          ';' +
          file?.name.split('.')[1];

        this.notifyFileChange();
      };
    }
  }

  notifyFileChange() {
    this.parametersPromptNotificationService.notifyChange(<IParameterValue>{
      parameter: this.parameter,
      value: this.fileValue,
    });
  }
}
