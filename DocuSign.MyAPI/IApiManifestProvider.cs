using DocuSign.MyAPI.Domain;

namespace DocuSign.MyAPI
{
    public interface IApiManifestProvider
    {  
        Task<ScenarioBase[]> GetScenarios();
        Task<Scenario> GetScenarioByNumber(int number);
    }
}