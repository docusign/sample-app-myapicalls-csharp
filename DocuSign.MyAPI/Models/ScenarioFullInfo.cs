namespace DocuSign.MyAPI.Domain
{
    public class ScenarioFullInfo
    {
        public string Name { get; set; }
        public string Title { get; set; }
        public string sampleFeatures { get; set; }
        public string codeFlow { get; set; }
        public string Description { get; set; }
        public ScenarioStep[] Steps { get; set; }
        public ParametersPromptFullInfo[] ParameterPrompts { get; set; }

    }
}
