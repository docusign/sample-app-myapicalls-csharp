using Newtonsoft.Json;

namespace DocuSign.MyAPI.Domain
{
    public class Scenario: ScenarioBase
    {
        [JsonRequired]
        public Step[] Steps { get; set; }
    }
}
