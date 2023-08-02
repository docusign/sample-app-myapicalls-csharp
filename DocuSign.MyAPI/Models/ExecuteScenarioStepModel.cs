using DocuSign.MyAPI.Domain;

namespace DocuSign.MyAPI.Models
{
    public class ExecuteScenarioStepModel : ExecuteScenarioModel
    {
        public string StepName { get; set; }

        public StepResponse[] PreviousStepResponses { get; set; }
        public StepParameters[] PreviousStepParameters { get; set; }
    }
}
