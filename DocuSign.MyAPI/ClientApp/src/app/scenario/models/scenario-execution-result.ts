export interface IScenarioExecutionResult {
  dateTime: Date;
  scenarioId: number;
  scenarioName: string;
  stepName: string;
  api: string;
  methodType: string;
  requestBody: string;
  response: string;
  responseCode: string;
  success: boolean;
}
