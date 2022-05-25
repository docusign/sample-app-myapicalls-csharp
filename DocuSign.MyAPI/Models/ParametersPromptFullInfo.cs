namespace DocuSign.MyAPI.Domain
{
    public class ParametersPromptFullInfo
    {
        public string stepName { get; set; }
        public string name { get; set; }
        public string defaultValue { get; set; }
        public string title { get; set; }
        public string type { get; set; }
        public string requestParameterType { get; set; }
        public string requestParameterPath { get; set; }
        public string note { get; set; }
        public bool required { get; set; }
        public Dictionary<string, string> options { get; set; }
    }
}