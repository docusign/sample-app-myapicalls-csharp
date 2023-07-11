using Newtonsoft.Json;

namespace DocuSign.MyAPI.Domain
{
    public class StepParameterValue
    {
        [JsonRequired]
        public string Name { get; set; }

        [JsonRequired]
        public string Value { get; set; }
    }

    public class StepParameters
    {
        [JsonRequired]
        public string StepName { get; set; }

        [JsonRequired]
        public StepParameterValue[] Parameters { get; set; }
    }
}
