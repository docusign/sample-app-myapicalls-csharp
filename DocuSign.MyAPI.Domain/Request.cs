using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace DocuSign.MyAPI.Domain
{
    public class Request
    {
        [JsonRequired]
        public string Host { get; set; }

        [JsonRequired]
        public string Api { get; set; }

        [JsonRequired]
        public string Method { get; set; }

        [JsonRequired]
        public string DocumentationUrl { get; set; }

        [JsonRequired]
        public Parameter[] Parameters { get; set; }

        [JsonRequired]
        public JToken BodyTemplate { get; set; }
    }
}