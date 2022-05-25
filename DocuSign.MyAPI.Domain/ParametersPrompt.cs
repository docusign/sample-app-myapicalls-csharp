using Newtonsoft.Json;

namespace DocuSign.MyAPI.Domain
{
    public class ParametersPrompt
    {
        [JsonRequired]
        public string Name { get; set; }

        [JsonRequired]
        public string DefaultValue { get; set; }

        [JsonRequired]
        public string Title { get; set; }

        [JsonRequired]
        public string Type { get; set; }

        [JsonRequired]
        public string RequestParameterType { get; set; }

        [JsonRequired]
        public string RequestParameterPath { get; set; }

        [JsonRequired]
        public string Note { get; set; }

        [JsonRequired]
        public bool Required { get; set; }

        public Dictionary<string, string> Options { get; set; }
    }
}