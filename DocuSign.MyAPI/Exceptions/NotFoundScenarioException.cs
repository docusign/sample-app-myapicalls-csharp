namespace DocuSign.MyAPI.Exceptions
{
    public class NotFoundScenarioException : Exception
    {
        public NotFoundScenarioException(string message) : base(message)
        {
        }

        public NotFoundScenarioException(string message, Exception ex) : base(message, ex)
        {

        }
    }
}
