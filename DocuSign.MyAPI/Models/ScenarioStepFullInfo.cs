namespace DocuSign.MyAPI.Domain
{
    public class ScenarioStepFullInfo
    {
        public string Name { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Api { get; set; }
        public string Method { get; set; }
        public string DocumentationUrl { get; set; }
        public ParametersPrompt[] ParameterPrompts { get; set; }
        public string BodyTemplate { get; set; }
        public Parameter[] RequestParameters { get; set; }
    }
}
