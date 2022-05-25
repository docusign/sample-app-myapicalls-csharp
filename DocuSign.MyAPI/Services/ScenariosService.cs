using AutoMapper;

using DocuSign.MyAPI.Domain;
using Microsoft.Extensions.Caching.Memory;

namespace DocuSign.MyAPI.Services
{
    public class ScenariosService : IScenariosService
    {
        private readonly IApiManifestProvider _apiManifestProvider;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _memoryCache;
        private readonly IConfiguration _configuration;

        public ScenariosService(
            IApiManifestProvider apiManifestProvider,
            IMapper mapper,
            IMemoryCache cache,
            IConfiguration configuration)
        {
            _apiManifestProvider = apiManifestProvider;
            _mapper = mapper;
            _memoryCache = cache;
            _configuration = configuration;
        }

        public async Task<string[]> GetCategoriesFilters()
        {
            ScenarioBase[] scenarios = await RetrieveScenarios();

            return scenarios.SelectMany(x => x.Categories).Distinct().ToArray();
        }

        public async Task<string[]> GetAreasFilters()
        {
            ScenarioBase[] scenarios = await RetrieveScenarios();

            return scenarios.SelectMany(x => x.Areas).Distinct().ToArray();
        }

        public async Task<ScenarioShortInfo[]> GetScenarios()
        {
            ScenarioBase[] scenarios = await RetrieveScenarios();

            return scenarios.Select(x => _mapper.Map<ScenarioShortInfo>(x)).ToArray();
        }

        public async Task<ScenarioFullInfo> GetScenarioInfo(int scenarioNumber)
        {
            ScenarioBase scenario = await _apiManifestProvider.GetScenarioByNumber(scenarioNumber);

            return _mapper.Map<ScenarioFullInfo>(scenario);
        }

        public async Task<ScenarioStepFullInfo> GetScenarioStepInfo(int scenarioNumber, string stepName)
        {
            Scenario scenario = await _apiManifestProvider.GetScenarioByNumber(scenarioNumber);
            var step = scenario.Steps.Where(s => s.Name.Equals(stepName)).FirstOrDefault();

            if (step == null)
            {
                throw new InvalidOperationException($"Step {stepName} does not exist for {scenario.Name} scenario!");
            }

            var stepFullInfo = new ScenarioStepFullInfo
            {
                Name = step.Name,
                Title = step.Title,
                Description = step.Description,
                Api = step.Request.Api,
                Method = step.Request.Method,
                DocumentationUrl = step.Request.DocumentationUrl,
                ParameterPrompts = step.ParametersPrompts,
                BodyTemplate = step.Request.BodyTemplate.ToString(),
                RequestParameters = step.Request.Parameters,
            };

            return stepFullInfo;
        }

        private async Task<ScenarioBase[]> RetrieveScenarios()
        {
            ScenarioBase[] scenarios;
            if (!_memoryCache.TryGetValue("Scenarios", out scenarios))
            {
                scenarios = await _apiManifestProvider.GetScenarios();

                var minutes = _configuration.GetValue<int?>("CacheTimeSpanMinutes");

                if (!minutes.HasValue) throw new InvalidOperationException("Error getting value from configuration property CacheTimeSpanMinutes!");

                if (minutes > 0)
                {
                    _memoryCache.Set(
                        "Scenarios",
                        scenarios,
                        new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(minutes.Value)));
                }
            }

            return scenarios;
        }
    }
}
