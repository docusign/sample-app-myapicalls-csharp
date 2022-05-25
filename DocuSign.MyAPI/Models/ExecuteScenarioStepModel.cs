namespace DocuSign.MyAPI.Models
{
    public class ExecuteScenarioStepModel : ExecuteScenarioModel
    {
        public string StepName { get; set; }

        public StepResponse[] PreviousStepResponses { get; set; }
    }
}
