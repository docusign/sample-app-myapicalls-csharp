using Newtonsoft.Json;

namespace DocuSign.MyAPI.Domain
{
    public class Parameter
    {
        [JsonRequired]
        public string Name { get; set; }

        [JsonRequired]
        public string In { get; set; }

        [JsonRequired]
        public string RequestParameterPath { get; set; }

        [JsonRequired]
        public string Description { get; set; }

        public string ResponseParameterPath { get; set; }

        public string Source { get; set; }

        public string Error { get; set; }

        public string isFromUi { get; set; }
    }
}