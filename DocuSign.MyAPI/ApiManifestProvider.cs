using DocuSign.MyAPI.Domain;

using Newtonsoft.Json;

using System.Text.RegularExpressions;

namespace DocuSign.MyAPI
{
    public class ApiManifestProvider : IApiManifestProvider
    {
        private readonly ILogger<ApiManifestProvider> _logger;
        private readonly IConfiguration _configuration;

        public ApiManifestProvider(ILogger<ApiManifestProvider> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }
 
        public async Task<Scenario> GetScenarioByNumber(int number)
        {
            var manifestName = $"Scenario_{number}";
            var nameRegExp = new Regex($"{manifestName}\\D");
            var file = Directory.GetFiles(_configuration["ManifestFolder"], $"{manifestName}*.json")
                .Where(f => nameRegExp.IsMatch(f))
                .FirstOrDefault();
            Scenario scenario = null;
            if (file == null)
            {
                throw new FileNotFoundException($"Manifest file {manifestName} not found! Scenario not loaded.");
            }

            string fileContent = await File.ReadAllTextAsync(file);
            if (fileContent == null)
            {
                throw new InvalidOperationException($"Manifest file {manifestName} is empty!");
            }

            scenario = JsonConvert.DeserializeObject<Scenario>(fileContent);
            if (scenario == null)
            {
                throw new InvalidOperationException($"Unable to parse scenario from file {file}!");
            }

            scenario.ScenarioNumber = number;

            return scenario;
        }

        public async Task<ScenarioBase[]> GetScenarios()
        {
            var scenarioNumberRegExp = new Regex("(?<=Scenario_)\\d+");
            var scenarios = new List<ScenarioBase>();
            foreach (string file in Directory.EnumerateFiles(_configuration["ManifestFolder"], "Scenario*.json"))
            {
                string json = await File.ReadAllTextAsync(file);
                string scenarioNumberStr = scenarioNumberRegExp.Match(file).Value;
                int scenarioNumber;
                if (!int.TryParse(scenarioNumberStr, out scenarioNumber))
                {

                    _logger.LogError("Manifest file  {0} has wrong name format.", file);
                    continue;
                }

                if (string.IsNullOrEmpty(json))
                {
                    _logger.LogError("Manifest file {0} is empty! Scenario not loaded.", file);
                    continue;
                }

                try
                {
                    var scenario = JsonConvert.DeserializeObject<ScenarioBase>(json);
                    if (scenario == null)
                    {
                        _logger.LogError("Unable to parse scenario from file {0}.", file);
                    }
                    else
                    {
                        scenario.ScenarioNumber = scenarioNumber;
                        scenarios.Add(scenario);
                    }
                }
                catch (JsonSerializationException ex)
                {
                    _logger.LogError(ex.Message);
                    _logger.LogError(ex.StackTrace);
                }
                catch (JsonReaderException ex)
                {
                    _logger.LogError(ex.Message);
                    _logger.LogError(ex.StackTrace);
                }
            }

            return scenarios.ToArray();
        }
    }
}
