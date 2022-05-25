using System.Net;

namespace DocuSign.MyAPI.Models
{
    public class ExecutionResponse: StepResponse
    {
        public DateTime DateTime { get; set; }

        public int ScenarioId { get; set; }

        public string ScenarioName { get; set; }
         
        public string API { get; set; }

        public string MethodType { get; set; }

        public string RequestBody { get; set; } 
    }

    public class StepResponse
    { 
        public string StepName { get; set; } 
        public string Response { get; set; } 
        public HttpStatusCode ResponseCode { get; set; } 
        public bool Success { get; set; }
    }
}
