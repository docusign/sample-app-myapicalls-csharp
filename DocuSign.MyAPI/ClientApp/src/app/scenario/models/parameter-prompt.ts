import { ParameterPromptType } from './parameter-prompt-type';

export interface IParameterPrompt {
  stepName: string;
  name: string;
  defaultValue: string;
  title: string;
  type: string;
  requestParameterType: string;
  requestParameterPath: string;
  note: string;
  required: boolean;
  options?: any;
}

export interface IParameterValue {
  parameter: IParameterPrompt;
  value: any;
}
