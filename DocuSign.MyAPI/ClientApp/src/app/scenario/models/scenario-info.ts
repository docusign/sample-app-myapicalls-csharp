import { IScenarioStep } from './scenario-step';
import { IParameterPrompt } from './parameter-prompt';

export interface IScenarioInfo {
  scenarioNumber: number;
  name: string;
  title: string;
  sampleFeatures: string;
  codeFlow: string;
  description: string;
  steps: IScenarioStep[];
  parameterPrompts: IParameterPrompt[];
  completed: boolean;
}
