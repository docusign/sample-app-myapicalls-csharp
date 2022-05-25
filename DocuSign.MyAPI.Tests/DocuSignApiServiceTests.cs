using AutoMapper;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using DocuSign.MyAPI.Domain;
using DocuSign.MyAPI.Services;
using FluentAssertions;
using Moq;
using Xunit;
using System.IO;
using System;
using Newtonsoft.Json.Linq;

namespace DocuSign.MyAPI.Tests
{
    public class DocuSignApiServiceTests
    {
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly IMemoryCache _memoryCache;

        public DocuSignApiServiceTests()
        {
            _mapper = new Mapper(new MapperConfiguration(config => config.AddProfile<ScenarioProfile>()));
            _memoryCache = new Mock<MemoryCache>(new MemoryCacheOptions()).Object;
            
            var mockSection = new Mock<IConfigurationSection>();
            mockSection.Setup(s => s.Value).Returns("30");

            var configuration = new Mock<IConfiguration>();
            configuration.Setup(x => x.GetSection(It.Is<string>(s => s == "CacheTimeSpanMinutes")))
                .Returns(mockSection.Object);

            _configuration = configuration.Object;
        }

        [Fact]
        public async void GetCategoriesFilters_WithSeveralCategoriesAndScenarios_ReturnsCorrectResut()
        {
            var apiConfig = new Mock<IApiManifestProvider>();
            apiConfig.Setup(x => x.GetScenarios()).ReturnsAsync(new ScenarioBase[]
            {
                new ScenarioBase
                {
                    Name = "Test Scenario 1",
                    Categories = new[] { "Category 1", "Category 2" }
                },
                 new ScenarioBase
                 {
                     Name = "Test Scenario 2",
                     Categories = new[] { "Category 2" }
                 } });

            var sut = new ScenariosService(apiConfig.Object, _mapper, _memoryCache, _configuration);
            var result = await sut.GetCategoriesFilters();

            result.Should().BeEquivalentTo(new[] { "Category 1", "Category 2" });
        }

        [Fact]
        public async void GetAreasFilters_WithSeveralAreasAndScenarios_ReturnsCorrectResut()
        {
            var apiConfig = new Mock<IApiManifestProvider>();
            apiConfig.Setup(x => x.GetScenarios()).ReturnsAsync(new ScenarioBase[] {
                new ScenarioBase {
                    Name = "Test Scenario 1",
                    Areas = new[] { "Area 1", "Area 2" }
                 },
                 new ScenarioBase
                 {
                     Name = "Test Scenario 2",
                     Areas = new[] { "Area 2" }
                 } });

            var sut = new ScenariosService(apiConfig.Object, _mapper, _memoryCache, _configuration);
            var result = await sut.GetAreasFilters();

            result.Should().BeEquivalentTo(new[] { "Area 1", "Area 2" });
        }

        [Fact]
        public async void GetScenarios_WithScenarios_ReturnsCorrectResut()
        {
            var apiConfig = new Mock<IApiManifestProvider>();
            apiConfig.Setup(x => x.GetScenarios()).ReturnsAsync(new ScenarioBase[] {
                new ScenarioBase {
                    Name = "Test Scenario 1",
                    Description = "Test Scenario 1 Description",
                    Title = "Test Scenario 1 Title",
                    Categories = new[] { "Category 1", "Category 2" },
                    Areas = new[] { "Area 1", "Area 2" },
                    ScenarioNumber = 0
                 },
                 new ScenarioBase
                 {
                    Name = "Test Scenario 2",
                    Description = "Test Scenario 2 Description",
                    Title = "Test Scenario 2 Title",
                    Categories = new[] { "Category 1" },
                    Areas = new[] { "Area 2" },
                    ScenarioNumber = 1
                 }
            });

            var sut = new ScenariosService(apiConfig.Object, _mapper, _memoryCache, _configuration);
            var result = await sut.GetScenarios();

            result.Should().BeEquivalentTo(new ScenarioShortInfo[] {
                new ScenarioShortInfo {
                    Name = "Test Scenario 1",
                    Description = "Test Scenario 1 Description",
                    Title = "Test Scenario 1 Title",
                    Categories = new[] { "Category 1", "Category 2" },
                    Areas = new[] { "Area 1", "Area 2" },
                    ScenarioNumber = 0
                 },
                 new ScenarioShortInfo
                 {
                    Name = "Test Scenario 2",
                    Description = "Test Scenario 2 Description",
                    Title = "Test Scenario 2 Title",
                    Categories = new[] { "Category 1" },
                    Areas = new[] { "Area 2" },
                    ScenarioNumber = 1
                 }
            });
        }

        [Fact]
        public async void GetScenarioInfo_WithScenarios_ReturnsCorrectResult()
        {
            var scenarioNumber = 1;

            var apiConfig = new Mock<IApiManifestProvider>();
            apiConfig.Setup(x => x.GetScenarioByNumber(scenarioNumber)).ReturnsAsync(
                new Scenario
                {
                    Name = "Test Scenario 1",
                    Description = "Test Scenario 1 Description",
                    Title = "Test Scenario 1 Title",
                    Areas = new[] { "Area 1" },
                    Steps = new[]
                    {
                        new Step
                        {
                            Name = "Name 1",
                            Title = "Title 1",
                            ParametersPrompts = new[] {
                                new ParametersPrompt
                                {
                                    Type = "Parameter 1",
                                    Title = "Title 1",
                                    Note = "Parameter 1",
                                    RequestParameterPath = "Parameter path 1",
                                    RequestParameterType = "Parameter type 1",
                                    Name = "Parameter name",
                                    DefaultValue = "Default value",
                                    Required = false,
                                }
                            }
                        }
                    }
                });

            var sut = new ScenariosService(apiConfig.Object, _mapper, _memoryCache, _configuration);
            var result = await sut.GetScenarioInfo(scenarioNumber);

            result.Should().BeEquivalentTo(new ScenarioFullInfo
            {
                Name = "Test Scenario 1",
                Description = "Test Scenario 1 Description",
                Title = "Test Scenario 1 Title",
                Steps = new[] { new ScenarioStep { Name = "Name 1", Title = "Title 1" } },
                ParameterPrompts = new[]
                {
                    new ParametersPromptFullInfo
                    {
                        stepName = "Name 1",
                        type = "Parameter 1",
                        title = "Title 1",
                        note = "Parameter 1",
                        requestParameterPath = "Parameter path 1",
                        requestParameterType = "Parameter type 1",
                        name = "Parameter name",
                        defaultValue = "Default value",
                        required = false,
                    }
                }
            });
        }

        [Fact]
        public async void GetScenarioInfo_WithoutScenarios_ServiceThrowsException()
        {
            var scenarioNumber = 1;

            var apiConfig = new Mock<IApiManifestProvider>();
            apiConfig.Setup(x => x.GetScenarioByNumber(scenarioNumber))
                .ThrowsAsync(new FileNotFoundException("File not found"));

            var sut = new ScenariosService(apiConfig.Object, _mapper, _memoryCache, _configuration);
            var result = () => sut.GetScenarioInfo(scenarioNumber);

            await result.Should().ThrowAsync<FileNotFoundException>();
        }

        [Fact]
        public async void GetScenarioInfo_WithInvalidScenarios_ServiceThrowsException()
        {
            var scenarioNumber = 1;

            var apiConfig = new Mock<IApiManifestProvider>();
            apiConfig.Setup(x => x.GetScenarioByNumber(scenarioNumber))
                .ThrowsAsync(new InvalidOperationException("Unable to parse scenario"));

            var sut = new ScenariosService(apiConfig.Object, _mapper, _memoryCache, _configuration);
            var result = () => sut.GetScenarioInfo(scenarioNumber);

            await result.Should().ThrowAsync<InvalidOperationException>();
        }

        [Fact]
        public async void GetScenarioStepInfo_WithValidScenario_ReturnsCorrectResult()
        {
            var scenarioNumber = 1;
            var stepName = "Name 1";
            var bodyTemplate = JToken.Parse("{\n\"template\": \"template body\"\n}");

            var apiConfig = new Mock<IApiManifestProvider>();
            apiConfig.Setup(x => x.GetScenarioByNumber(scenarioNumber)).ReturnsAsync(
                new Scenario
                {
                    Name = "Test Scenario 1",
                    Description = "Test Scenario 1 Description",
                    Title = "Test Scenario 1 Title",
                    Areas = new[] { "Area 1" },
                    Steps = new[]
                    {
                        new Step
                        {
                            Name = "Name 1",
                            Title = "Title 1",
                            Description = "Description 1",
                            ParametersPrompts = new[] {
                                new ParametersPrompt
                                {
                                    Name = "Name 1",
                                    Type = "Parameter 1",
                                    Title = "Title 1",
                                    Note = "Parameter 1",
                                    RequestParameterPath = "Parameter name 1",
                                    RequestParameterType = "Parameter type 1",
                                    DefaultValue = "Default value",
                                    Required = true,
                                }
                            },
                            Request = new Request
                            {
                                Api = "/v2.1/accounts/{accountId}/envelopes",
                                Method = "post",
                                BodyTemplate = bodyTemplate,
                                DocumentationUrl = "esign-rest-api/reference/envelopes/envelopes/create/"
                            }
                        }
                    }
                });

            var sut = new ScenariosService(apiConfig.Object, _mapper, _memoryCache, _configuration);
            var result = await sut.GetScenarioStepInfo(scenarioNumber, stepName);

            result.Should().BeEquivalentTo(new ScenarioStepFullInfo
            {
                Name = "Name 1",
                Title = "Title 1",
                Description = "Description 1",
                Api = "/v2.1/accounts/{accountId}/envelopes",
                Method = "post",
                DocumentationUrl = "esign-rest-api/reference/envelopes/envelopes/create/",
                ParameterPrompts = new[] {
                    new ParametersPrompt
                    {
                        Name = "Name 1",
                        Type = "Parameter 1",
                        Title = "Title 1",
                        Note = "Parameter 1",
                        RequestParameterPath = "Parameter name 1",
                        RequestParameterType = "Parameter type 1",
                        DefaultValue = "Default value",
                        Required = true,
                    }
                },
                BodyTemplate = bodyTemplate.ToString(),
            });
        }

        [Fact]
        public async void GetScenarioStepInfo_WithValidScenarioNotExistingStep_ServiceThrowsException()
        {
            var scenarioNumber = 1;
            var stepName = "Nonexistent Name";

            var apiConfig = new Mock<IApiManifestProvider>();
            apiConfig.Setup(x => x.GetScenarioByNumber(scenarioNumber)).ReturnsAsync(
                new Scenario
                {
                    Name = "Test Scenario 1",
                    Description = "Test Scenario 1 Description",
                    Title = "Test Scenario 1 Title",
                    Areas = new[] { "Area 1" },
                    Steps = new[]
                    {
                        new Step
                        {
                            Name = "Name 1",
                            Title = "Title 1",
                            Description = "Description 1",
                            ParametersPrompts = new[] {
                                new ParametersPrompt
                                {
                                    Name = "Name 1",
                                    Type = "Parameter 1",
                                    Title = "Title 1",
                                    Note = "Parameter 1",
                                    RequestParameterPath = "Parameter name 1",
                                    RequestParameterType = "Parameter type 1",
                                    DefaultValue = "Default value",
                                    Required = true,
                                }
                            },
                            Request = new Request
                            {
                                Api = "/v2.1/accounts/{accountId}/envelopes",
                                Method = "post",
                                DocumentationUrl = "esign-rest-api/reference/envelopes/envelopes/create/",
                            }
                        }
                    }
                });

            var sut = new ScenariosService(apiConfig.Object, _mapper, _memoryCache, _configuration);
            var result = () => sut.GetScenarioStepInfo(scenarioNumber, stepName);

            await result.Should().ThrowAsync<InvalidOperationException>();
        }
    }
}