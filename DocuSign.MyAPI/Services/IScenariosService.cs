
using DocuSign.MyAPI.Domain;

namespace DocuSign.MyAPI.Services
{
    public interface IScenariosService
    {
        Task<string[]> GetAreasFilters();
        Task<string[]> GetCategoriesFilters();
        Task<ScenarioFullInfo> GetScenarioInfo(int scenarioNumber);
        Task<ScenarioShortInfo[]> GetScenarios();
        Task<ScenarioStepFullInfo> GetScenarioStepInfo(int scenarioNumber, string stepName);
    }
}