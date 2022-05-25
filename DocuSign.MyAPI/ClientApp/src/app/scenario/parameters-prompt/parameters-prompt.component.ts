import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
  FormArray,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { ParameterPromptType } from '../models/parameter-prompt-type';
import { IParameterPrompt } from '../models/parameter-prompt';
import { AccountService } from 'src/app/services/account-service';
import { ParameterControlComponent } from './parameter-control/parameter-control.component';

@Component({
  selector: 'app-parameters-prompt',
  templateUrl: './parameters-prompt.component.html',
  styleUrls: ['./parameters-prompt.component.scss'],
})
export class ParametersPromptComponent
  implements OnInit, AfterViewChecked, OnChanges
{
  @Input() parameterPrompts: IParameterPrompt[] = [];
  @Input() submitCallback!: (args: any) => void;
  @Input() scope: string = '';
  @Output() formCreated = new EventEmitter();
  @ViewChildren(ParameterControlComponent)
  paramControls!: QueryList<ParameterControlComponent>;

  parameterPromptsGrouped!: any[];
  form!: FormGroup;
  payLoad = '';

  constructor(
    private fb: FormBuilder,
    @Inject(AccountService) private accountService: AccountService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  get canExecute() {
    return this.form.valid && this.isUserLoggedIn();
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
    this.paramControls.forEach((control) => {
      if (control.control?.value != null && control.control?.value !== '') {
        control.notifyChange();
      }
    });
  }

  ngOnChanges() {
    this.createForm();

    if ((this.form.controls?.parametersPrompts as FormArray).length > 0) {
      this.formCreated.next();
    }
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.form = this.toFormGroup(this.parameterPrompts);
    this.parameterPromptsGrouped = this.groupByStep(this.parameterPrompts);
  }

  isUserLoggedIn(): Observable<boolean> {
    return this.accountService.isLoggedIn();
  }

  onSubmit() {
    if (this.scope === 'Step') {
      if (this.parameterPrompts.length > 0) {
        var formData = this.form.controls.parametersPrompts as FormArray;
        this.submitCallback((formData.at(0) as FormGroup).getRawValue());
      } else {
        this.submitCallback(null);
      }
    } else {
      this.submitCallback(
        (this.form.controls.parametersPrompts as FormArray).getRawValue()
      );
    }
    this.paramControls.forEach((control) => {
      control.notifyChange();
    });
  }

  toFormGroup(parameterPrompts: IParameterPrompt[]) {
    let form = this.fb.group({
      parametersPrompts: this.fb.array([]),
    });
    const parametersPrompts = form.controls.parametersPrompts as FormArray;
    let parameterPromptsGrouped = this.groupByStep(parameterPrompts);

    parameterPromptsGrouped.forEach((prompt) => {
      const group: any = {};

      prompt.parameters.forEach((p: IParameterPrompt) => {
        var defaultValue =
          p.type == ParameterPromptType.file ? '' : p.defaultValue;

        group[p.name] = p.required
          ? p.type == ParameterPromptType.email
            ? new FormControl(defaultValue, [
                Validators.required,
                Validators.email,
                Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+[.]+[a-z]+$'),
              ])
            : new FormControl(defaultValue, Validators.required)
          : new FormControl(defaultValue);
        if (this.scope === 'Scenario') {
          group['stepName'] = new FormControl(
            prompt.stepName,
            Validators.required
          );
        }
      });
      parametersPrompts.push(this.fb.group(group));
    });

    return form;
  }

  groupByStep(parameterPrompts: IParameterPrompt[]) {
    var group_to_values = parameterPrompts.reduce(function (obj: any, item) {
      obj[item.stepName] = obj[item.stepName] || [];
      obj[item.stepName].push(item);
      return obj;
    }, {});

    var groups = Object.keys(group_to_values).map(function (key) {
      return { stepName: key, parameters: group_to_values[key] };
    });
    return groups;
  }

  getGroupeControls(i: number) {
    return (this.form.controls.parametersPrompts as FormArray).controls[
      i
    ] as FormGroup;
  }

  getGroupeControlsValue(i: number) {
    return this.getGroupeControls(i).value;
  }
}
