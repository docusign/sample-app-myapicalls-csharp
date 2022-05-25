using Newtonsoft.Json;

namespace DocuSign.MyAPI.Domain
{
    public class Step
    {
        [JsonRequired]
        public string Name { get; set; }

        [JsonRequired]
        public string Title { get; set; }

        public string ShortDescription { get; set; }

        [JsonRequired]
        public string Description { get; set; }

        [JsonRequired]
        public Request Request { get; set; }

        [JsonRequired]
        public ParametersPrompt[] ParametersPrompts { get; set; }
    }
}
