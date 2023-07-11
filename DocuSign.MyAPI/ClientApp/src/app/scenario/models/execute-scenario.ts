export interface IExecuteScenario {
  scenarioNumber: number;
  parameters: string;
  iterationCount: number;
}

export interface IExecuteScenarioStep {
  scenarioNumber: number;
  stepName: string;
  parameters: string;
  previousStepResponses: IStepResponse[];
  previousStepParameters: IStepParameters[];
}

export interface IStepResponse {
  stepName: string;
  response: string;
}

export interface IStepParameterValue {
  name: string;
  value: any;
}

export interface IStepParameters {
  stepName: string;
  parameters: IStepParameterValue[];
}