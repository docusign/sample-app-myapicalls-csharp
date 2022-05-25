namespace DocuSign.MyAPI.Domain
{
    public class ScenarioShortInfo
    {
        public int ScenarioNumber { get; set; }
        public string Name { get; set; }
        public string Title { get; set; }
        public string ShortDescription { get; set; }

        public string codeFlow { get; set; }
        public string Description { get; set; } 
        public string[] Areas { get; set; }
        public string[] Categories { get; set; }
    }
}