import { IParameterPrompt } from './parameter-prompt';

export interface IStepInfo {
  name: string;
  title: string;
  description: string;
  api: string;
  method: string;
  parameterPrompts: IParameterPrompt[];
  bodyTemplate: string;
  documentationUrl: string;
  requestParameters: IParameter[];
}

export interface IParameter {
  name: string;
  in: string;
  requestParameterPath: string;
  description: string;
  responseParameterPath: string;
  source: string;
}
