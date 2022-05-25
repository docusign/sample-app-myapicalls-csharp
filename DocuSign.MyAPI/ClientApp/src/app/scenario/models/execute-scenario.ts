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
}

export interface IStepResponse {
  stepName: string;
  response: string;
}
