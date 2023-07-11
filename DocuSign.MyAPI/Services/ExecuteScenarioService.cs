using DocuSign.MyAPI.Domain;
using DocuSign.MyAPI.Exceptions;
using DocuSign.MyAPI.Models;

using Microsoft.AspNetCore.Authentication;

using Newtonsoft.Json.Linq;

using System.Net.Http.Headers;
using System.Runtime.CompilerServices;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

[assembly: InternalsVisibleTo("DocuSign.MyAPI.Tests")]
namespace DocuSign.MyAPI.Services
{
    public class ExecuteScenarioService : IExecuteScenarioService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IApiManifestProvider _docuSignApiConfigurationProvider;
        private readonly HttpClient _httpClient;
        private readonly IRandomGenerator _randomGenerator;
        private const string PARAMETER_DESTINATION_BODY = "body";
        private const string PARAMETER_DESTINATION_PATH = "path";
        private const string SubstitutionParameterPatternIteration = "{iteration}";
        private const string SubstitutionParameterPatternRandom = "{random}";

        public ExecuteScenarioService(IHttpContextAccessor httpContextAccessor,
            IApiManifestProvider docuSignApiConfigurationProvider,
            HttpClient httpClient,
            IRandomGenerator randomGenerator)
        {
            _httpContextAccessor = httpContextAccessor;
            _docuSignApiConfigurationProvider = docuSignApiConfigurationProvider;
            _httpClient = httpClient;
            _randomGenerator = randomGenerator;
        }

        public async Task<IList<ExecutionResponse>> ExecuteScenario(int scenarioNumber, string requestParameters, int iterationsCount)
        {
            Scenario scenario;
            try
            {
                scenario = await _docuSignApiConfigurationProvider.GetScenarioByNumber(scenarioNumber);
            }
            catch (FileNotFoundException ex)
            {
                throw new NotFoundScenarioException($"Scenario with number {scenarioNumber} not found.", ex);
            }

            var executionResponsesAll = new List<ExecutionResponse>();
            iterationsCount = iterationsCount == default ? 1 : iterationsCount;

            for (int i = 1; i <= iterationsCount; i++)
            {
                var executionResponsesWithinScenario = new List<ExecutionResponse>();
                var previousStepParametersWithinScenario = new List<(string, List<(string, JProperty)>)>();

                var parameters = new List<(string, JProperty)>();

                foreach (var step in scenario.Steps)
                {
                    List<(string, JProperty)> jPropertiesFromRequest = GetParametersFromRequest(requestParameters, step, i, _randomGenerator.Generate());
                    parameters = jPropertiesFromRequest;

                    List<(string, JProperty)> jPropertiesFromClaims = GetParametersFromClaims(step.Request.Parameters);
                    parameters.AddRange(jPropertiesFromClaims);

                    List<(string, JProperty)> jPropertiesFromPreviousStep = GetParametersFromPreviousSteps(
                        executionResponsesWithinScenario.Select(x => (StepResponse)x).ToArray(),
                        step.Request.Parameters);
                    parameters.AddRange(jPropertiesFromPreviousStep);

                    if (previousStepParametersWithinScenario.Count > 0)
                    {
                        var previousParameters = GetValuesFromPreviousStepsParameters(previousStepParametersWithinScenario, step.Request.Parameters);
                        parameters.AddRange(previousParameters);
                    }

                    previousStepParametersWithinScenario.Add((step.Name, jPropertiesFromRequest));

                    ExecutionResponse response = await ExecuteStep(step, scenario, parameters);
                    response.ScenarioName = scenario.Name;

                    executionResponsesWithinScenario.Add(response);
                    if (!response.Success)
                    {
                        break;
                    }
                }

                executionResponsesAll.AddRange(executionResponsesWithinScenario);
            }

            return executionResponsesAll;
        }

        public async Task<ExecutionResponse> ExecuteScenarioStep(int scenarioNumber, string stepName, string requestParameters, StepResponse[] previouseStepResponses, StepParameters[] previousStepParameters)
        {
            var parameters = new List<(string, JProperty)>();
            Scenario scenario;
            try
            {
                scenario = await _docuSignApiConfigurationProvider.GetScenarioByNumber(scenarioNumber);
            }
            catch (FileNotFoundException ex)
            {
                throw new NotFoundScenarioException($"Scenario with number {scenarioNumber} not found.", ex);
            }

            Step? step = scenario.Steps?.FirstOrDefault(a => string.Equals(a.Name, stepName, StringComparison.CurrentCultureIgnoreCase));
            if (step == null)
            {
                throw new NotFoundStepException($"Step with name {stepName} is not found.");
            }

            if (!string.IsNullOrWhiteSpace(requestParameters))
            {
                List<(string, JProperty)> jPropertiesFromRequest = GetParametersFromStepRequest(requestParameters, step, null, _randomGenerator.Generate());
                parameters = jPropertiesFromRequest;
            }

            List<(string, JProperty)> jPropertiesFromClaims = GetParametersFromClaims(step.Request.Parameters);
            parameters.AddRange(jPropertiesFromClaims);

            if (previouseStepResponses?.Length > 0)
            {
                List<(string, JProperty)> jPropertiesFromPreviousStep = GetParametersFromPreviousSteps(previouseStepResponses, step.Request.Parameters);
                parameters.AddRange(jPropertiesFromPreviousStep);
            }

            if (previousStepParameters?.Length > 0)
            {
                List<(string, JProperty)> jPropertiesFromPreviousStep = GetValuesFromPreviousStepsParameters(previousStepParameters, step.Request.Parameters);
                parameters.AddRange(jPropertiesFromPreviousStep);
            }

            ExecutionResponse response = await ExecuteStep(step, scenario, parameters);
            response.ScenarioName = scenario.Name;

            return response;
        }

        internal async Task<ExecutionResponse> ExecuteStep(Step step, Scenario scenario, List<(string, JProperty)> jProperties)
        {
            var message = new HttpRequestMessage();
            message.Method = new HttpMethod(step.Request.Method);

            string? token = await _httpContextAccessor.HttpContext.GetTokenAsync("access_token");
            if (token == null)
            {
                throw new UnauthorizedAccessException("No token provided");
            }
            message.Headers.Add("Authorization", "Bearer " + token);
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            List<JProperty> bodyProps = jProperties.Where(a => string.Equals(a.Item1, PARAMETER_DESTINATION_BODY, StringComparison.CurrentCultureIgnoreCase)).Select(s => s.Item2).ToList();
            JToken body = MapParametersToBody(step, bodyProps);

            List<JProperty> uriProps = jProperties.Where(a => string.Equals(a.Item1, PARAMETER_DESTINATION_PATH, StringComparison.CurrentCultureIgnoreCase)).Select(s => s.Item2).ToList();
            string apiUri = MapParametersToUri(step.Request.Api, uriProps);

            message.RequestUri = new Uri(step.Request.Host + apiUri);

            if (message.Method != HttpMethod.Get)
            {
                message.Content = new StringContent(body.ToString(), Encoding.UTF8, "application/json");
            }

            var response = await _httpClient.SendAsync(message);

            return new ExecutionResponse
            {
                DateTime = DateTime.Now,
                API = apiUri,
                ScenarioId = scenario.ScenarioNumber,
                ScenarioName = scenario.Name,
                MethodType = step.Request.Method,
                StepName = step.Name,
                RequestBody = body.ToString(),
                Response = await response.Content.ReadAsStringAsync(),
                ResponseCode = response.StatusCode,
                Success = (response.StatusCode == System.Net.HttpStatusCode.OK || response.StatusCode == System.Net.HttpStatusCode.Created)
            };
        }

        internal string MapParametersToUri(string apiUrl, List<JProperty> properties)
        {
            foreach (var item in properties)
            {
                apiUrl = Regex.Replace(apiUrl, "{" + item.Name + "}", item.Value.ToString());
            }

            if (Regex.IsMatch(apiUrl, "{\\w*}"))
            {
                throw new InvalidOperationException("All parameters should be mapped in the url.");
            }

            return apiUrl;
        }

        internal JToken MapParametersToBody(Step step, List<JProperty> properties)
        {
            foreach (var item in properties)
            {
                ParametersPrompt? parameter = step.ParametersPrompts?.FirstOrDefault(a => string.Equals(a.Name, item.Name, StringComparison.CurrentCultureIgnoreCase));

                if (parameter?.Type == "file")
                {
                    MapFileProperty(step.Request.BodyTemplate, parameter, item, properties);
                    continue;
                }

                var path = parameter?.RequestParameterPath;
                if (path == null)
                {
                    path = step?.Request.Parameters?.FirstOrDefault(p => string.Equals(p.Name, item.Name, StringComparison.CurrentCultureIgnoreCase))?.RequestParameterPath;
                }

                if (path != null)
                {
                    var tokenProp = step.Request.BodyTemplate.SelectToken(path)?.Parent as JProperty;
                    if (tokenProp != null)
                    {
                        tokenProp.Value = item.Value;
                    }
                    else
                    {
                        var value = step.Request.BodyTemplate.SelectToken(path) as JValue;
                        value?.Replace(item.Value);
                    }
                }
            }

            return step.Request.BodyTemplate;
        }


        internal List<(string, JProperty)> GetParametersFromRequest(string parameters, Step step, int? iteration, int random)
        {
            var jProperties = new List<(string, JProperty)>();
            JArray jsonArray = JArray.Parse(parameters);

            foreach (JToken? jsonObject in jsonArray)
            {
                var stepNameProperty = jsonObject.SelectToken("stepName").Parent as JProperty;
                if (string.Equals(stepNameProperty.Value.ToString(), step.Name, StringComparison.CurrentCultureIgnoreCase))
                {
                    jProperties.AddRange(GetParametersFromStepData((JObject)jsonObject, step, iteration, random));
                }
            }

            return jProperties;
        }

        internal List<(string, JProperty)> GetParametersFromStepRequest(string parameters, Step step, int? iteration, int random)
        {
            return GetParametersFromStepData(JObject.Parse(parameters), step, iteration, random);
        }

        private List<(string, JProperty)> GetParametersFromStepData(JObject parametersObject, Step step, int? iteration, int random)
        {
            var jProperties = new List<(string, JProperty)>();

            foreach (var property in parametersObject.Children())
            {
                var jProperty = (JProperty)property;

                ParametersPrompt? requestParameterPrompt = step.ParametersPrompts.FirstOrDefault(a => string.Equals(a.Name, jProperty.Name, StringComparison.CurrentCultureIgnoreCase));
                if (requestParameterPrompt == null)
                {
                    continue;
                }
                if (requestParameterPrompt.Type == "file")
                {
                    var base64Property = parametersObject.SelectToken(jProperty.Name + "_base64").Parent as JProperty;
                    if (base64Property != null)
                    {
                        jProperties.Add((requestParameterPrompt.RequestParameterType, base64Property));
                    }

                    jProperty.Value = jProperty.Value.ToString().Replace('\\', Path.DirectorySeparatorChar);
                }

                if (iteration.HasValue)
                {
                    jProperty.Value = jProperty.Value.ToString().Replace(SubstitutionParameterPatternIteration, iteration.ToString());
                }
                jProperty.Value = jProperty.Value.ToString().Replace(SubstitutionParameterPatternRandom, random.ToString());

                jProperties.Add((requestParameterPrompt.RequestParameterType, jProperty));
            }

            return jProperties;
        }

        internal List<(string, JProperty)> GetParametersFromPreviousSteps(StepResponse[] executionResponses, Parameter[] stepParameters)
        {
            var jProperties = new List<(string, JProperty)>();

            IEnumerable<Parameter> filteredStepParameters = stepParameters.Where(a => !String.IsNullOrEmpty(a.Source) && string.IsNullOrEmpty(a.isFromUi) || string.Equals(a.isFromUi, "false", StringComparison.CurrentCultureIgnoreCase));

            Dictionary<string, JObject> responsesByStepName = executionResponses
                .Where(x => !string.IsNullOrEmpty(x.Response))
                .ToDictionary(r => r.StepName, r => JObject.Parse(r.Response));

            var emptyParameterException = "The response parameter is empty.";

            foreach (var stepParameter in filteredStepParameters)
            {
                var response = responsesByStepName.FirstOrDefault(r => string.Equals(r.Key, stepParameter.Source, StringComparison.CurrentCultureIgnoreCase));
                if (response.Key == null)
                {
                    throw new ScenarioExecutionException(stepParameter.Error ?? emptyParameterException);
                }

                var sourceProperty = response.Value.SelectToken(stepParameter.ResponseParameterPath)?.Parent as JProperty;

                if (sourceProperty == null)
                {
                    throw new ScenarioExecutionException(stepParameter.Error ?? emptyParameterException);
                }

                var prop = new JProperty(stepParameter.Name, sourceProperty.Value.ToString());

                jProperties.Add((stepParameter.In, prop));
            }

            return jProperties;
        }

        internal List<(string, JProperty)> GetParametersFromClaims(Parameter[] stepParameters)
        {
            var jProperties = new List<(string, JProperty)>();
            var filteredStepParameters = stepParameters.Where(a => String.IsNullOrEmpty(a.Source));

            foreach (var stepParameter in filteredStepParameters)
            {
                Claim? claimValue = _httpContextAccessor.HttpContext.User.FindFirst(stepParameter.RequestParameterPath);

                if (claimValue != null)
                {
                    jProperties.Add((stepParameter.In, new JProperty(stepParameter.RequestParameterPath, claimValue.Value)));
                }
            }
            return jProperties;
        }

        internal List<(string, JProperty)> GetValuesFromPreviousStepsParameters(StepParameters[] previousParamameters, Parameter[] stepParameters)
        {
            var jProperties = new List<(string, JProperty)>();
            IEnumerable<Parameter> filteredStepParameters = stepParameters.Where(a => !String.IsNullOrEmpty(a.Source) && string.Equals(a.isFromUi, "true", StringComparison.CurrentCultureIgnoreCase));

            var emptyParameterException = "The response parameter is empty.";

            foreach (var stepParameter in filteredStepParameters)
            {
                var parameters = previousParamameters.FirstOrDefault(s => string.Equals(s.StepName, stepParameter.Source, StringComparison.CurrentCultureIgnoreCase));
                if (parameters == null)
                {
                    throw new ScenarioExecutionException(stepParameter.Error ?? emptyParameterException);
                }

                var sourceProperty = parameters.Parameters.FirstOrDefault(p => string.Equals(p.Name, stepParameter.Name, StringComparison.CurrentCultureIgnoreCase));
                if (sourceProperty == null)
                {
                    throw new ScenarioExecutionException(stepParameter.Error ?? emptyParameterException);
                }

                var prop = new JProperty(stepParameter.Name, sourceProperty.Value.ToString());

                jProperties.Add((stepParameter.In, prop));
            }

            return jProperties;
        }

        internal List<(string, JProperty)> GetValuesFromPreviousStepsParameters(List<(string, List<(string, JProperty)>)> previousParamameters, Parameter[] stepParameters)
        {
            var jProperties = new List<(string, JProperty)>();
            IEnumerable<Parameter> filteredStepParameters = stepParameters.Where(a => !String.IsNullOrEmpty(a.Source) && string.Equals(a.isFromUi, "true", StringComparison.CurrentCultureIgnoreCase));

            var emptyParameterException = "The response parameter is empty.";

            foreach (var stepParameter in filteredStepParameters)
            {
                var parameters = previousParamameters.FirstOrDefault(s => string.Equals(s.Item1, stepParameter.Source, StringComparison.CurrentCultureIgnoreCase));
                if (string.IsNullOrEmpty(parameters.Item1) || parameters.Item2 == null)
                {
                    throw new ScenarioExecutionException(stepParameter.Error ?? emptyParameterException);
                }

                var sourceProperty = parameters.Item2.FirstOrDefault(p => string.Equals(p.Item2.Name, stepParameter.Name, StringComparison.CurrentCultureIgnoreCase));
                if (string.IsNullOrEmpty(sourceProperty.Item1) || sourceProperty.Item2 == null)
                {
                    throw new ScenarioExecutionException(stepParameter.Error ?? emptyParameterException);
                }

                var prop = new JProperty(stepParameter.Name, sourceProperty.Item2.Value.ToString());

                jProperties.Add((stepParameter.In, prop));
            }

            return jProperties;
        }

        private void SetPropertyValue(JToken body, string path, JToken value)
        {
            if (!string.IsNullOrWhiteSpace(path))
            {
                var tokenProperty = body.SelectToken(path)?.Parent as JProperty;
                if (tokenProperty != null)
                {
                    tokenProperty.Value = value;
                }
            }
        }

        private void MapFileProperty(JToken body, ParametersPrompt parameter, JProperty property, List<JProperty> properties)
        {
            string[] paramsPaths = parameter.RequestParameterPath.Split(';');

            JProperty base64 = properties.FirstOrDefault(p => p.Name == property.Name + "_base64");
            if (base64 != null)
            {
                SetPropertyValue(body, paramsPaths[0], base64.Value);
            }

            if (paramsPaths.Length > 1)
            {
                if (paramsPaths[1] != String.Empty)
                {
                    SetPropertyValue(body, paramsPaths[1], Path.GetFileNameWithoutExtension(property.Value.ToString()));
                }

                if (paramsPaths.Length > 2 && paramsPaths[2] != String.Empty)
                {
                    SetPropertyValue(body, paramsPaths[2], Path.GetExtension(property.Value.ToString()));
                }
            }
        }
    }
}
