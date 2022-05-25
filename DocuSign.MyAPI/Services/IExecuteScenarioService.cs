using DocuSign.MyAPI.Models;
using System.Runtime.CompilerServices;

[assembly: InternalsVisibleTo("DocuSign.MyAPI.Tests")]
namespace DocuSign.MyAPI.Services
{
    public interface IExecuteScenarioService
    {
        Task<IList<ExecutionResponse>> ExecuteScenario(int scenarioNumber, string requestParameters, int iterationsCount);
        Task<ExecutionResponse> ExecuteScenarioStep(int scenarioNumber, string stepName, string parameters, StepResponse[] previouseStepResponse);
    }
}
