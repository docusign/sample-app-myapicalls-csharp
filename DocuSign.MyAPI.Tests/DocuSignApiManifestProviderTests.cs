using Xunit; 
using DocuSign.MyAPI.Domain;
using FluentAssertions;
using Moq;
using Microsoft.Extensions.Logging;
using System.IO;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;

namespace DocuSign.MyAPI.Tests
{
    public class DocuSignApiManifestProviderTests
    {
        private readonly ILogger<ApiManifestProvider> _docusignManifestProviderLogger;
        private readonly IConfiguration _configuration;

        public DocuSignApiManifestProviderTests()
        {
            _docusignManifestProviderLogger = new Mock<ILogger<ApiManifestProvider>>().Object; 

            var inMemorySettings = new Dictionary<string, string> {
                {"ManifestFolder", "ManifestTest"}, 
            }; 
            IConfiguration configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();
            _configuration = configuration;
        }

        [Fact]
        public async void GetScenarios_WithValidAndInvalidFiles_ReturnsCorrectScenariosNumber()
        {
            var sut = new ApiManifestProvider(_docusignManifestProviderLogger, _configuration);
            ScenarioBase[] result = await sut.GetScenarios();

            result.Length.Should().Be(3);
        }

        [Fact]
        public async void GetScenarioInfo_WithValidFilesAndScenarioNumber_ReturnsCorrectScenarioInfo()
        {
            var scenarioNumber = 1;
            var sut = new ApiManifestProvider(_docusignManifestProviderLogger, _configuration);
            var result = await sut.GetScenarioByNumber(scenarioNumber);

            result.Should().NotBeNull();
        }

        [Fact]
        public async void GetScenarioInfo_WithValidFilesAndNotValidScenarioNumber_ThrowsException()
        {
            var scenarioNumber = -1;
            var sut = new ApiManifestProvider(_docusignManifestProviderLogger, _configuration);
            var result = () => sut.GetScenarioByNumber(scenarioNumber);

            await result.Should().ThrowAsync<FileNotFoundException>();
        }

        [Fact]
        public async void GetScenarioInfo_WithValidFileValidScenarioNumberExtraSymbolsInFileName_ReturnsCorrectScenarioInfo()
        {
            var scenarioNumber = 5;
            var sut = new ApiManifestProvider(_docusignManifestProviderLogger, _configuration);
            var result = await sut.GetScenarioByNumber(scenarioNumber);

            result.Should().NotBeNull();
        }
    }
}