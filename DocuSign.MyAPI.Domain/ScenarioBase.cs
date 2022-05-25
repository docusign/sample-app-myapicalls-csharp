using Newtonsoft.Json;

namespace DocuSign.MyAPI.Domain
{
    public class ScenarioBase
    {
        public int ScenarioNumber { get; set; }

        [JsonRequired]
        public string Name { get; set; }

        [JsonRequired]
        public string Title { get; set; }

        public string ShortDescription { get; set; }
        public string sampleFeatures { get; set; }

        public string codeFlow { get; set; }

        [JsonRequired]
        public string Description { get; set; }

        [JsonRequired]
        public string[] Categories { get; set; }

        [JsonRequired]
        public string[] Areas { get; set; }
    }
}