using DocuSign.MyAPI.Domain;
using DocuSign.MyAPI.Exceptions;
using DocuSign.MyAPI.Models;
using DocuSign.MyAPI.Services;

using FluentAssertions;

using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;

using Moq;
using Moq.Protected;

using Newtonsoft.Json.Linq;

using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

using Xunit;

namespace DocuSign.MyAPI.Tests
{
    public class ExecuteScenarioServiceTests
    {
        private Mock<IRandomGenerator> _randomGenerator;
        private readonly ExecuteScenarioService _executeScenarioService;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Mock<IApiManifestProvider> _mockDocuSignApiManifestProvider;
        private readonly Mock<HttpMessageHandler> _mockMessageHandler;

        public ExecuteScenarioServiceTests()
        {
            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();

            var authenticationServiceMock = new Mock<IAuthenticationService>();

            var authResult = AuthenticateResult.Success(
                new AuthenticationTicket(new ClaimsPrincipal(), "DocuSign"));

            authResult.Properties?.StoreTokens(new[]
            {
              new AuthenticationToken { Name = "access_token", Value = "token_123" }
            });

            var serviceProvider = new Mock<IServiceProvider>();
            authenticationServiceMock
                .Setup(x => x.AuthenticateAsync(It.IsAny<HttpContext>(), It.IsAny<string>()))
                .ReturnsAsync(authResult);

            serviceProvider.Setup(_ => _.GetService(typeof(IAuthenticationService))).Returns(authenticationServiceMock.Object);

            var context = new DefaultHttpContext()
            {
                RequestServices = serviceProvider.Object
            };

            var fakeAccountIdClaim = new List<Claim> { new Claim("accountId", "accountId123") };
            context.User.AddIdentity(new ClaimsIdentity(fakeAccountIdClaim));

            _mockHttpContextAccessor.Setup(_ => _.HttpContext).Returns(context);

            _mockDocuSignApiManifestProvider = new Mock<IApiManifestProvider>();
            _mockDocuSignApiManifestProvider.Setup(_ => _.GetScenarioByNumber(It.IsAny<int>())).ReturnsAsync(new Scenario());

            _mockMessageHandler = new Mock<HttpMessageHandler>();
            _mockMessageHandler.Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync((HttpRequestMessage a, CancellationToken b) =>
                {
                    return new HttpResponseMessage
                    {
                        StatusCode = HttpStatusCode.OK,
                        Content = new StringContent("testResponse")
                    };
                });

            var httpClient = new HttpClient(_mockMessageHandler.Object);

            _randomGenerator = new Mock<IRandomGenerator>();

            _executeScenarioService = new ExecuteScenarioService(_mockHttpContextAccessor.Object, _mockDocuSignApiManifestProvider.Object, httpClient, _randomGenerator.Object);
        }


        [Fact]
        public void GetParametersFromClaims_CorrectParameter_ReturnListTupleWithAccountId()
        {
            //Arrange
            var parameter = new Parameter[1]
            {
                new Parameter { In = "Path", RequestParameterPath = "AccountId", ResponseParameterPath = "AccountId" }
            };

            var jProp = new JProperty("AccountId", "accountId123");
            var expectedResult = new List<(string, JProperty)> { new("Path", jProp) };

            //Act
            var result = _executeScenarioService.GetParametersFromClaims(parameter);

            //Assert
            Assert.Equal(expectedResult, result);
        }

        [Fact]
        public void GetParametersFromClaims_IncorrectRequestParameterPathParameter_ReturnEmptyListTuple()
        {
            //Arrange
            var parameter = new Parameter[1]
            {
                new Parameter { In = "Path", RequestParameterPath = "BadAccountId", ResponseParameterPath = "AccountId" }
            };

            var expectedResult = new List<(string, JProperty)> { };

            //Act
            var result = _executeScenarioService.GetParametersFromClaims(parameter);

            //Assert
            Assert.Equal(expectedResult, result);
        }

        [Fact]
        public void GetParametersFromClaims_ContextWithoutAccountIdClaim_ReturnEmptyListTuple()
        {
            //Arrange
            var context = new DefaultHttpContext();
            var fakeAccountIdClaim = new List<Claim>();
            context.User.AddIdentity(new ClaimsIdentity(fakeAccountIdClaim));
            _mockHttpContextAccessor.Setup(_ => _.HttpContext).Returns(context);

            var parameter = new Parameter[1]
            {
                new Parameter { In = "Path", RequestParameterPath = "AccountId", ResponseParameterPath = "AccountId" }
            };

            var expectedResult = new List<(string, JProperty)>();

            //Act
            var result = _executeScenarioService.GetParametersFromClaims(parameter);

            //Assert
            Assert.Equal(expectedResult, result);
        }

        [Fact]
        public void GetParametersFromClaims_ParametersListEmpty_ReturnEmptyListTuple()
        {
            //Arrange
            var context = new DefaultHttpContext();
            var fakeAccountIdClaim = new List<Claim>();
            context.User.AddIdentity(new ClaimsIdentity(fakeAccountIdClaim));
            _mockHttpContextAccessor.Setup(_ => _.HttpContext).Returns(context);

            var parameter = new Parameter[0];

            var expectedResult = new List<(string, JProperty)>();

            //Act
            var result = _executeScenarioService.GetParametersFromClaims(parameter);

            //Assert
            Assert.Equal(expectedResult, result);
        }

        [Fact]
        public void GetParametersFromPreviousSteps_CorrectArguments_ReturnListTupleWithNameProperty()
        {
            //Arrange
            var executionModel = new[]
            {
                new ExecutionResponse {StepName = "TestStep", Response = "{\"Name\": \"Vasa\"}"}
            };

            var parameter = new Parameter[1]
            {
                new Parameter { Name="Name", In = "Path", RequestParameterPath = "Name", ResponseParameterPath = "Name", Source = "TestStep" }
            };

            var expectedResult = new List<(string, JProperty)>
            {
                new ("Path", new JProperty("Name", "Vasa"))
            };

            //Act
            var result = _executeScenarioService.GetParametersFromPreviousSteps(executionModel, parameter);

            //Assert
            Assert.Equal(expectedResult, result);
        }

        [Fact]
        public void GetParametersFromPreviousSteps_ExecutionResponseModelEmpty_ReturnsScenarioExecutionException()
        {
            //Arrange
            var executionModel = Array.Empty<StepResponse>();

            var parameter = new Parameter[1]
            {
                new Parameter { In = "Path", RequestParameterPath = "Name", ResponseParameterPath = "Name", Source = "TestStep", Error = "Error message." }
            };

            //Assert
            Assert.Throws<ScenarioExecutionException>(() => _executeScenarioService.GetParametersFromPreviousSteps(executionModel, parameter));
        }

        [Fact]
        public void GetParametersFromPreviousSteps_StepParametersEmpty_ReturnEmptyListTuple()
        {
            //Arrange
            var executionModel = new StepResponse[]
            {
                new ExecutionResponse {StepName = "TestStep", Response = "{\"Name\": \"Vasa\"}"}
            };

            var parameter = new Parameter[0];

            var expectedResult = new List<(string, JProperty)>();

            //Act
            var result = _executeScenarioService.GetParametersFromPreviousSteps(executionModel, parameter);

            //Assert
            Assert.Equal(expectedResult, result);
        }

        [Fact]
        public void GetParametersFromPreviousSteps_StepNameNotMatch_ReturnsScenarioExecutionException()
        {
            //Arrange
            var executionModel = new StepResponse[]
            {
                new ExecutionResponse {StepName = "BadTestStep", Response = "{\"Name\": \"Vasa\"}"}
            };

            var parameter = new Parameter[1]
            {
                new Parameter { In = "Path", RequestParameterPath = "Name", ResponseParameterPath = "Name", Source = "TestStep" }
            };

            //Assert
            Assert.Throws<ScenarioExecutionException>(() => _executeScenarioService.GetParametersFromPreviousSteps(executionModel, parameter));
        }

        [Fact]
        public void GetParametersFromRequest_CorrectArguments_ReturnListTupleWithNameParameter()
        {
            //Arrange
            var parameters = "[{\"name\": \"Vas\", \"stepName\": \"TestStep\"}]";

            var step = new Step
            {
                Name = "TestStep",
                ParametersPrompts = new ParametersPrompt[1]
                {
                    new ParametersPrompt {Name = "name", RequestParameterPath = "Name", RequestParameterType = "Body" }
                }
            };

            var expectedResult = new List<(string, JProperty)>
            {
               new ("Body", new JProperty("name", "Vas")),
            };

            //Act
            var result = _executeScenarioService.GetParametersFromRequest(parameters, step, 0, 0);

            //Assert
            Assert.Equal(expectedResult, result);
        }

        [Fact]
        public void GetParametersFromRequest_SeveralParameters_OneParameterPrompt_ReturnListTupleWithNameParameterOnly()
        {
            //Arrange
            var parameters = "[{\"name\": \"Vas\", \"email\": \"eamil@t.b\", \"stepName\": \"TestStep\"}]";

            var step = new Step
            {
                Name = "TestStep",
                ParametersPrompts = new ParametersPrompt[1]
                {
                    new ParametersPrompt {Name = "name", RequestParameterPath = "Name", RequestParameterType = "Body" }
                }
            };

            var expectedResult = new List<(string, JProperty)>
            {
               new ("Body", new JProperty("name", "Vas")),
            };

            //Act
            var result = _executeScenarioService.GetParametersFromRequest(parameters, step, 0, 0);

            //Assert
            Assert.Equal(expectedResult, result);
        }

        [Fact]
        public void GetParametersFromRequest_TwoParameters_TwoParameterPrompt_ReturnListTupleWithTwoParameters()
        {
            //Arrange
            var parameters = "[{\"name\": \"Vas\", \"email\": \"eamil@t.b\", \"stepName\": \"TestStep\"}]";

            var step = new Step
            {
                Name = "TestStep",
                ParametersPrompts = new ParametersPrompt[2]
                {
                    new ParametersPrompt {Name = "name", RequestParameterPath = "Name", RequestParameterType = "Body" },
                    new ParametersPrompt {Name = "email", RequestParameterPath = "email", RequestParameterType = "Body" }
                }
            };

            var expectedResult = new List<(string, JProperty)>
            {
               new ("Body", new JProperty("name", "Vas")),
               new ("Body", new JProperty("email", "eamil@t.b"))
            };

            //Act
            var result = _executeScenarioService.GetParametersFromRequest(parameters, step, 0, 0);

            //Assert
            Assert.Equal(expectedResult, result);
        }


        [Fact]
        public void GetParametersFromRequest_EmptyParameters_ReturnEmptyListTuple()
        {
            //Arrange
            var parameters = "[]";

            var step = new Step
            {
                Name = "TestStep",
                ParametersPrompts = new ParametersPrompt[1]
                {
                    new ParametersPrompt { RequestParameterPath = "Name", RequestParameterType = "Body" }
                }
            };

            var expectedResult = new List<(string, JProperty)>();

            //Act
            var result = _executeScenarioService.GetParametersFromRequest(parameters, step, 0, 0);

            //Assert
            Assert.Equal(expectedResult, result);
        }

        [Fact]
        public void GetParametersFromRequest_ParameterPromptEmpty_ReturnEmptyListTuple()
        {
            //Arrange
            var parameters = "[{\"Name\": \"Vas\", \"stepName\": \"TestStep\"}]";

            var step = new Step
            {
                Name = "TestStep",
                ParametersPrompts = new ParametersPrompt[0]
            };

            var expectedResult = new List<(string, JProperty)>();

            //Act
            var result = _executeScenarioService.GetParametersFromRequest(parameters, step, 0, 0);

            //Assert
            Assert.Equal(expectedResult, result);
        }

        [Fact]
        public void MapParametersToBody_CorrectArgument_ReturnJTokenWithNewValue()
        {
            //Arrange
            var step = new Step
            {
                ParametersPrompts = new ParametersPrompt[2]
                {
                    new ParametersPrompt {
                        RequestParameterPath = "obj1",
                        Name = "objname1",
                    },
                    new ParametersPrompt {
                        RequestParameterPath = "obj2",
                        Name = "objname2",
                    }
                },
                Request = new Request
                {
                    BodyTemplate = JToken.Parse("{\"obj1\": \"val1\", \"obj2\": \"val2\"}")
                }
            };

            var properties = new List<JProperty>
            {
               new JProperty("objname1", "newVal1"),
               new JProperty("objname2", "newVal2")
            };

            var expectedResult = JToken.Parse("{\"obj1\": \"newVal1\", \"obj2\": \"newVal2\"}");

            //Act
            var result = _executeScenarioService.MapParametersToBody(step, properties);

            //Assert
            Assert.Equal(expectedResult.ToString(), result.ToString());
        }

        [Fact]
        public void MapParametersToBody_PropertiesEmpty_ReturnJTokenWithoutChanges()
        {
            //Arrange
            var step = new Step
            {
                ParametersPrompts = new ParametersPrompt[2]
                {
                    new ParametersPrompt {
                        RequestParameterType = "obj1",
                        Name = "obj1",
                    },
                    new ParametersPrompt {
                        RequestParameterType = "obj2",
                        Name = "obj2",
                    }
                },
                Request = new Request
                {
                    BodyTemplate = JToken.Parse("{\"obj1\": \"val1\", \"obj2\": \"val2\"}")
                }
            };

            var properties = new List<JProperty>();

            var expectedResult = JToken.Parse("{\"obj1\": \"val1\", \"obj2\": \"val2\"}");

            //Act
            var result = _executeScenarioService.MapParametersToBody(step, properties);

            //Assert
            Assert.Equal(expectedResult.ToString(), result.ToString());
        }

        [Fact]
        public void MapParametersToBody_PropertiesNotExistInBody_ReturnJTokenWithoutChanges()
        {
            //Arrange
            var step = new Step
            {
                ParametersPrompts = new ParametersPrompt[2]
                {
                    new ParametersPrompt {
                        RequestParameterType = "obj1",
                        Name = "objname1",
                    },
                    new ParametersPrompt {
                        RequestParameterType = "obj2",
                        Name = "objname2",
                    }
                },
                Request = new Request
                {
                    BodyTemplate = JToken.Parse("{\"obj1\": \"val1\", \"obj2\": \"val2\"}")
                }
            };

            var properties = new List<JProperty>
            {
               new JProperty("obj3", "newVal3")
            };

            var expectedResult = JToken.Parse("{\"obj1\": \"val1\", \"obj2\": \"val2\"}");

            //Act
            var result = _executeScenarioService.MapParametersToBody(step, properties);

            //Assert
            Assert.Equal(expectedResult.ToString(), result.ToString());
        }

        [Fact]
        public void MapParametersToUri_CorrectArgument_ReturnUriWithAccountId()
        {
            //Arrange
            var mockJToken = "https://testapi.com/api/{accountId}";

            var properties = new List<JProperty>
            {
               new JProperty("accountId", "acc123")
            };

            var expectedResult = "https://testapi.com/api/acc123";

            //Act
            var result = _executeScenarioService.MapParametersToUri(mockJToken, properties);

            //Assert
            Assert.Equal(expectedResult, result);
        }

        [Fact]
        public void MapParametersToUri_ParametersListEmpty_ThrowInvalidOperationException()
        {
            //Arrange
            var mockJToken = "https://testapi.com/api/{accountId}";

            var properties = new List<JProperty>();

            //Act
            var result = () => _executeScenarioService.MapParametersToUri(mockJToken, properties);

            //Assert
            result.Should().Throw<InvalidOperationException>().WithMessage("All parameters should be mapped in the url.");
        }

        [Fact]
        public void MapParametersToUri_UriWithoutParameters_ReturnUriWithoutChanges()
        {
            //Arrange
            var mockJToken = "https://testapi.com/api/acc1444";

            var properties = new List<JProperty>
            {
                new JProperty("accountId", "acc123")
            };

            var expectedResult = "https://testapi.com/api/acc1444";

            //Act
            var result = _executeScenarioService.MapParametersToUri(mockJToken, properties);

            //Assert
            Assert.Equal(expectedResult, result);
        }

        [Fact]
        public async Task ExecuteStep_CorrectArgument_ReturnsCorrectResponse()
        {
            //Arrange 
            var scenario = new Scenario()
            {
                Name = "Scenario 1"
            };
            var step = new Step
            {
                Name = "TestStep",
                ParametersPrompts = new ParametersPrompt[2]
                {
                    new ParametersPrompt {
                        RequestParameterPath = "obj1",
                        Name = "objname1",
                    },
                    new ParametersPrompt {
                        RequestParameterPath = "obj2",
                        Name = "objname2",
                    }
                },
                Request = new Request
                {
                    Method = "POST",
                    Api = "https://testApi.com/api/createEntity/{accountId}",
                    BodyTemplate = JToken.Parse("{\"obj1\": \"val1\", \"obj2\": \"val2\"}")
                }
            };

            var properties = new List<(string, JProperty)>()
            {
                new ("Body", new JProperty("objname1", "newVal1")),
                new ("Body", new JProperty("objname2", "newVal2")),
                new ("Path", new JProperty("accountId", "acc123"))
            };

            var expectedBody = JToken.Parse("{\"obj1\": \"newVal1\", \"obj2\": \"newVal2\"}").ToString();

            //Act
            var response = await _executeScenarioService.ExecuteStep(step, scenario, properties);

            //Assert
            Assert.Equal("https://testApi.com/api/createEntity/acc123", response.API);
            Assert.Equal("Scenario 1", response.ScenarioName);
            Assert.Equal("POST", response.MethodType);
            Assert.Equal(expectedBody, response.RequestBody);
            Assert.Equal("testResponse", response.Response);
            Assert.Equal("TestStep", response.StepName);
        }

        [Fact]
        public async Task ExecuteStep_WithoutPathTypeInBodyProperties_ReturnResponseWithoutMappedBody()
        {
            //Arrange 
            var scenario = new Scenario()
            {
                Name = "Scenario 1"
            };

            var step = new Step
            {
                Name = "TestStep",
                Request = new Request
                {
                    Method = "POST",
                    Api = "https://testApi.com/api/createEntity",
                    BodyTemplate = JToken.Parse("{\"obj1\": \"val1\", \"obj2\": \"val2\"}")
                }
            };

            var properties = new List<(string, JProperty)>()
            {
                new ("1", new JProperty("obj1", "newVal1")),
                new ("1", new JProperty("obj2", "newVal2")),
                new ("Path", new JProperty("accountId", "acc123"))
            };

            var expectedBody = JToken.Parse("{\"obj1\": \"val1\", \"obj2\": \"val2\"}").ToString();

            //Act
            var response = await _executeScenarioService.ExecuteStep(step, scenario, properties);

            //Assert
            Assert.Equal("https://testApi.com/api/createEntity", response.API);
            Assert.Equal("Scenario 1", response.ScenarioName);
            Assert.Equal("POST", response.MethodType);
            Assert.Equal(expectedBody, response.RequestBody);
            Assert.Equal("testResponse", response.Response);
            Assert.Equal("TestStep", response.StepName);
        }

        [Fact]
        public async Task ExecuteStep_WithoutApiParameters_ThrowInvalidOperationException()
        {
            //Arrange 
            var scenario = new Scenario()
            {
                Name = "Scenario 1"
            };

            //Arrange 
            var step = new Step
            {
                Name = "TestStep",
                Request = new Request
                {
                    Method = "POST",
                    Api = "https://testApi.com/api/createEntity/{accountId}",
                    BodyTemplate = JToken.Parse("{\"obj1\": \"val1\", \"obj2\": \"val2\"}")
                }
            };

            var properties = new List<(string, JProperty)>()
            {
                new ("Body", new JProperty("obj1", "newVal1")),
                new ("Body", new JProperty("obj2", "newVal2")),
                new ("1", new JProperty("accountId", "acc123"))
            };

            //Act
            var result = () => _executeScenarioService.ExecuteStep(step, scenario, properties);

            //Assert
            await result.Should().ThrowAsync<InvalidOperationException>("All parameters should be mapped in the url.");
        }

        [Fact]
        public async Task ExecuteScenarioStep_CorrectArgument_ReturnCorrectResponse()
        {
            //Arrange
            var scenarioNumber = 1;
            var stepName = "TestStep";
            var parameters = "{\"Name\": \"Vas\", \"Email\": \"email@s.b\"}";

            _mockDocuSignApiManifestProvider.Setup(_ => _.GetScenarioByNumber(It.IsAny<int>())).ReturnsAsync(new Scenario
            {
                Steps = new Step[1] {
                    new Step {
                        Name = "Teststep",
                        ParametersPrompts = new ParametersPrompt[1]
                        {
                            new ParametersPrompt { Name="Name", RequestParameterPath = "name", RequestParameterType = "Body" },
                        },
                        Request = new Request
                        {
                            Method = "POST",
                            Api = "https://testApi.com/api/createEntity/{accountId}",
                            BodyTemplate = JToken.Parse("{\"name\": \"[name]\", \"email\": \"val2\"}"),
                            Parameters = new Parameter[1]
                            {
                                new Parameter
                                {
                                    RequestParameterPath = "accountId",
                                    Source = string.Empty,
                                    In = "Path"
                                }
                            }
                        }
                    }
                }
            });

            var expectedBody = JToken.Parse("{\"name\": \"Vas\", \"email\": \"val2\"}").ToString();

            //Act
            var response = await _executeScenarioService.ExecuteScenarioStep(scenarioNumber, stepName, parameters, new StepResponse[]{}, new StepParameters[]{});

            //Assert
            Assert.Equal("https://testApi.com/api/createEntity/accountId123", response.API);
            Assert.Equal("POST", response.MethodType);
            Assert.Equal(expectedBody, response.RequestBody);
            Assert.Equal("testResponse", response.Response);
            Assert.Equal("Teststep", response.StepName);
        }

        [Fact]
        public async Task ExecuteScenarioStep_CorrectArgumentsWithRandomParameter_ReturnCorrectResponse()
        {
            //Arrange
            var scenarioNumber = 1;
            var stepName = "TestStep";
            var parameters = "{\"Name\": \"User {random} name\", \"Email\": \"email@s.b\"}";

            _mockDocuSignApiManifestProvider.Setup(_ => _.GetScenarioByNumber(It.IsAny<int>())).ReturnsAsync(new Scenario
            {
                Steps = new Step[1] {
                    new Step {
                        Name = "Teststep",
                        ParametersPrompts = new ParametersPrompt[1]
                        {
                            new ParametersPrompt { Name="Name", RequestParameterPath = "name", RequestParameterType = "Body" },
                        },
                        Request = new Request
                        {
                            Method = "POST",
                            Api = "https://testApi.com/api/createEntity/{accountId}",
                            BodyTemplate = JToken.Parse("{\"name\": \"[name]\", \"email\": \"val2\"}"),
                            Parameters = new Parameter[1]
                            {
                                new Parameter
                                {
                                    RequestParameterPath = "accountId",
                                    Source = string.Empty,
                                    In = "Path"
                                }
                            }
                        }
                    }
                }
            });

            _randomGenerator.Setup(g => g.Generate()).Returns(25);
            var expectedBody = JToken.Parse("{\"name\": \"User 25 name\", \"email\": \"val2\"}").ToString();

            //Act
            var response = await _executeScenarioService.ExecuteScenarioStep(scenarioNumber, stepName, parameters, new StepResponse[]{}, new StepParameters[]{});

            //Assert
            Assert.Equal("https://testApi.com/api/createEntity/accountId123", response.API);
            Assert.Equal("POST", response.MethodType);
            Assert.Equal(expectedBody, response.RequestBody);
            Assert.Equal("testResponse", response.Response);
            Assert.Equal("Teststep", response.StepName);
        }

        [Fact]
        public async Task ExecuteScenarioStep_InvalidParametersPrompt_Skips_ReturnsCorrectResponse()
        {
            //Arrange
            var scenarioNumber = 1;
            var stepName = "TestStep";
            var parameters = "{\"Name\": \"Vas\", \"Email\": \"email@s.b\"}";

            _mockDocuSignApiManifestProvider.Setup(_ => _.GetScenarioByNumber(It.IsAny<int>())).ReturnsAsync(new Scenario
            {
                Steps = new Step[1] {
                    new Step {
                        Name = "Teststep",
                        ParametersPrompts = new ParametersPrompt[1]
                        {
                            new ParametersPrompt { Name="Name", RequestParameterPath = "Name", RequestParameterType = "Body" },
                        },
                        Request = new Request
                        {
                            Method = "POST",
                            Api = "https://testApi.com/api/createEntity/{accountId}",
                            BodyTemplate = JToken.Parse("{\"name\": \"[name]\", \"email\": \"val2\"}"),
                            Parameters = new Parameter[1]
                            {
                                new Parameter
                                {
                                    RequestParameterPath = "accountId",
                                    Source = string.Empty,
                                    In = "Path"
                                }
                            }
                        }
                    }
                }
            });

            var expectedBody = JToken.Parse("{\"name\": \"[name]\", \"email\": \"val2\"}").ToString();

            //Act
            var response = await _executeScenarioService.ExecuteScenarioStep(scenarioNumber, stepName, parameters, new StepResponse[]{}, new StepParameters[]{});

            //Assert
            Assert.Equal("https://testApi.com/api/createEntity/accountId123", response.API);
            Assert.Equal("POST", response.MethodType);
            Assert.Equal(expectedBody, response.RequestBody);
            Assert.Equal("testResponse", response.Response);
            Assert.Equal("Teststep", response.StepName);
        }

        [Fact]
        public async Task ExecuteScenarioStep_IncorrectScenario_ThrowNotFoundScenarioException()
        {
            //Arrange
            var scenarioNumber = -1;
            var stepName = "TestStep";
            var parameters = "[{\"Name\": \"Vas\", \"stepName\": \"TestStep\"}]";

            //Act
            var result = () => _executeScenarioService.ExecuteScenarioStep(scenarioNumber, stepName, parameters, new StepResponse[]{}, new StepParameters[]{});

            //Assert
            await result.Should().ThrowAsync<NotFoundStepException>().WithMessage("Step with name TestStep is not found.");
        }

        [Fact]
        public async Task ExecuteScenario_IncorrectScenario_ThrowNotFoundScenarioException()
        {
            //Arrange
            var scenarioNumber = -1;
            var parameters = "[{\"Name\": \"Vas\", \"stepName\": \"TestStep\"}]";

            _mockDocuSignApiManifestProvider.Setup(_ => _.GetScenarioByNumber(It.IsAny<int>())).Throws<FileNotFoundException>();

            //Act
            var result = () => _executeScenarioService.ExecuteScenario(scenarioNumber, parameters, 1);

            //Assert
            await result.Should().ThrowAsync<NotFoundScenarioException>().WithMessage("Scenario with number -1 not found.");
        }

        [Fact]
        public async Task ExecuteScenario_CorrectArgument_ReturnsCorrectResponse()
        {
            //Arrange
            var scenarioNumber = 1;
            var parameters = "[{\"name\": \"Vas\", \"stepName\": \"TestStep\"}]";

            _mockDocuSignApiManifestProvider.Setup(_ => _.GetScenarioByNumber(It.IsAny<int>())).ReturnsAsync(new Scenario
            {
                Steps = new Step[1] {
                    new Step {
                        Name = "Teststep",
                        ParametersPrompts = new ParametersPrompt[1]
                        {
                            new ParametersPrompt {Name="Name", RequestParameterPath = "user.name", RequestParameterType = "Body" },
                        },
                        Request = new Request
                        {
                            Method = "POST",
                            Api = "https://testApi.com/api/createEntity/{accountId}",
                            BodyTemplate = JToken.Parse("{\"user\" : { \"name\": \"[name]\", \"email\": \"val2\"}}"),
                            Parameters = new Parameter[1]
                            {
                                new Parameter
                                {
                                    RequestParameterPath = "accountId",
                                    Source = string.Empty,
                                    In = "Path"
                                }
                            }
                        }
                    }
                }
            });

            var expectedBody = JToken.Parse("{\"user\" : { \"name\": \"Vas\", \"email\": \"val2\"}}").ToString();

            //Act
            IList<ExecutionResponse>? responses = await _executeScenarioService.ExecuteScenario(scenarioNumber, parameters, 1);
            ExecutionResponse? response = responses[0];
            //Assert
            Assert.Equal("https://testApi.com/api/createEntity/accountId123", response.API);
            Assert.Equal("POST", response.MethodType);
            Assert.Equal(expectedBody, response.RequestBody);
            Assert.Equal("testResponse", response.Response);
            Assert.Equal("Teststep", response.StepName);
        }

        [Fact]
        public async Task ExecuteScenario_CorrectArgumentWithRandom_ReturnsCorrectResponse()
        {
            //Arrange
            var scenarioNumber = 1;
            var parameters = "[{\"name\": \"value {iteration} test\", \"lastName\": \"value {random} test\", \"stepName\": \"TestStep\"}]";

            _mockDocuSignApiManifestProvider.Setup(_ => _.GetScenarioByNumber(It.IsAny<int>())).ReturnsAsync(new Scenario
            {
                Steps = new Step[1] {
                    new Step {
                        Name = "Teststep",
                        ParametersPrompts = new ParametersPrompt[2]
                        {
                            new ParametersPrompt {Name="Name", RequestParameterPath = "user.name", RequestParameterType = "Body" }, 
                            new ParametersPrompt {Name="LastName", RequestParameterPath = "user.lastName", RequestParameterType = "Body" } 
                        },
                        Request = new Request
                        {
                            Method = "POST",
                            Api = "https://testApi.com/api/createEntity/{accountId}",
                            BodyTemplate = JToken.Parse("{\"user\" : { \"name\": \"[name]\", \"lastName\": \"[lastName]\",  \"email\": \"val2\"}}"),
                            Parameters = new Parameter[1]
                            {
                                new Parameter
                                {
                                    RequestParameterPath = "accountId",
                                    Source = string.Empty,
                                    In = "Path"
                                }
                            }
                        }
                    }
                }
            });

            var randomQueue = new Queue<int>();
            randomQueue.Enqueue(25);
            randomQueue.Enqueue(7);
            randomQueue.Enqueue(88);

            _randomGenerator.Setup(_ => _.Generate()).Returns(25);
            var i = 1;

            var expectedBody = JToken.Parse($@"{{""user"" : {{ ""name"": ""value {i++} test"", ""lastName"": ""value {randomQueue.Dequeue()} test"", ""email"": ""val2""}}}}").ToString();

            //Act
            IList<ExecutionResponse>? responses = await _executeScenarioService.ExecuteScenario(scenarioNumber, parameters, 1);
            ExecutionResponse? response = responses[0];
            //Assert
            Assert.Equal("https://testApi.com/api/createEntity/accountId123", response.API);
            Assert.Equal("POST", response.MethodType);
            Assert.Equal(expectedBody, response.RequestBody);
            Assert.Equal("testResponse", response.Response);
            Assert.Equal("Teststep", response.StepName);
        }

        [Fact]
        public async Task ExecuteScenario_SeveralSteps_ReturnsCorrectResponse()
        {
            //Arrange
            var scenarioNumber = 1;
            var parameters = "[{\"name\": \"Vas\", \"stepName\": \"TestStep\"}]";
            _mockMessageHandler.Reset();

            _mockMessageHandler.Protected()
               .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
               .ReturnsAsync((HttpRequestMessage a, CancellationToken b) =>
               {
                   return new HttpResponseMessage
                   {
                       StatusCode = HttpStatusCode.OK,
                       Content = new StringContent("{\"templateId\":\"sada7s84544\"}")
                   };
               });

            _mockDocuSignApiManifestProvider.Setup(_ => _.GetScenarioByNumber(It.IsAny<int>())).ReturnsAsync(new Scenario
            {
                Steps = new Step[2] {
                    new Step {
                        Name = "Teststep",
                        ParametersPrompts = new ParametersPrompt[1]
                        {
                            new ParametersPrompt {Name="Name", RequestParameterPath = "user.name", RequestParameterType = "Body" },
                        },
                        Request = new Request
                        {
                            Method = "POST",
                            Api = "https://testApi.com/api/createEntity/{accountId}",
                            BodyTemplate = JToken.Parse("{\"user\" : { \"name\": \"[name]\", \"email\": \"val2\"}}"),
                            Parameters = new Parameter[1]
                            {
                                new Parameter
                                {
                                    RequestParameterPath = "accountId",
                                    Source = string.Empty,
                                    In = "Path"
                                }
                            }
                        }
                    },
                    new Step {
                        Name = "Teststep2",
                        Request = new Request
                        {
                            Method = "POST",
                            Api = "https://testApi.com/api/createEntity/{templateId}",
                            BodyTemplate = JToken.Parse("{\"document\" : { \"templateId\": \"[id]\", \"name\": \"val3\"}}"),
                            Parameters = new Parameter[2]
                            {
                                new Parameter
                                {
                                    Name = "templIdBody",
                                    RequestParameterPath = "document.templateId",
                                    ResponseParameterPath = "templateId",
                                    Source = "Teststep",
                                    In = "Body"
                                },
                                new Parameter
                                {
                                    Name = "templateId",
                                    ResponseParameterPath = "templateId",
                                    Source = "Teststep",
                                    In = "Path"
                                }
                            }
                        }
                    }
                }
            });

            var expectedBody = JToken.Parse("{\"user\" : { \"name\": \"Vas\", \"email\": \"val2\"}}").ToString();

            //Act
            var responses = await _executeScenarioService.ExecuteScenario(scenarioNumber, parameters, 1);
            Assert.Equal(2, responses.Count);

            var response = responses[0];
            //Assert
            Assert.Equal("https://testApi.com/api/createEntity/accountId123", response.API);
            Assert.Equal("POST", response.MethodType);
            Assert.Equal(expectedBody, response.RequestBody);
            Assert.Equal("{\"templateId\":\"sada7s84544\"}", response.Response);
            Assert.Equal("Teststep", response.StepName);

            var expectedBody2 = JToken.Parse("{\"document\" : { \"templateId\": \"sada7s84544\", \"name\": \"val3\"}}").ToString();
            var response2 = responses[1];
            //Assert
            Assert.Equal("https://testApi.com/api/createEntity/sada7s84544", response2.API);
            Assert.Equal("POST", response2.MethodType);
            Assert.Equal(expectedBody2, response2.RequestBody);
            Assert.Equal("{\"templateId\":\"sada7s84544\"}", response2.Response);
            Assert.Equal("Teststep2", response2.StepName);
        }

        [Fact]
        public async Task ExecuteScenario_SeveralStepsAndSeveralIterations_ReturnsCorrectResponse()
        {
            //Arrange
            var scenarioNumber = 1;
            var parameters = "[{\"name\": \"Vas\", \"stepName\": \"TestStep\"}]";
            _mockMessageHandler.Reset();

            _mockMessageHandler.Protected()
               .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
               .ReturnsAsync((HttpRequestMessage a, CancellationToken b) =>
               {
                   return new HttpResponseMessage
                   {
                       StatusCode = HttpStatusCode.OK,
                       Content = new StringContent("{\"templateId\":\"sada7s84544\"}")
                   };
               });

            _mockDocuSignApiManifestProvider.Setup(_ => _.GetScenarioByNumber(It.IsAny<int>())).ReturnsAsync(new Scenario
            {
                Steps = new Step[2] {
                    new Step {
                        Name = "Teststep",
                        ParametersPrompts = new ParametersPrompt[1]
                        {
                            new ParametersPrompt {Name="Name", RequestParameterPath = "user.name", RequestParameterType = "Body" },
                        },
                        Request = new Request
                        {
                            Method = "POST",
                            Api = "https://testApi.com/api/createEntity/{accountId}",
                            BodyTemplate = JToken.Parse("{\"user\" : { \"name\": \"[name]\", \"email\": \"val2\"}}"),
                            Parameters = new Parameter[1]
                            {
                                new Parameter
                                {
                                    RequestParameterPath = "accountId",
                                    Source = string.Empty,
                                    In = "Path"
                                }
                            }
                        }
                    },
                    new Step {
                        Name = "Teststep2",
                        Request = new Request
                        {
                            Method = "POST",
                            Api = "https://testApi.com/api/createEntity/{templateId}",
                            BodyTemplate = JToken.Parse("{\"document\" : { \"templateId\": \"[id]\", \"name\": \"val3\"}}"),
                            Parameters = new Parameter[2]
                            {
                                new Parameter
                                {
                                    Name = "templIdBody",
                                    RequestParameterPath = "document.templateId",
                                    ResponseParameterPath = "templateId",
                                    Source = "Teststep",
                                    In = "Body"
                                },
                                new Parameter
                                {
                                    Name = "templateId",
                                    ResponseParameterPath = "templateId",
                                    Source = "Teststep",
                                    In = "Path"
                                }
                            }
                        }
                    }
                }
            });

            var expectedBody = JToken.Parse("{\"user\" : { \"name\": \"Vas\", \"email\": \"val2\"}}").ToString();

            //Act
            var responses = await _executeScenarioService.ExecuteScenario(scenarioNumber, parameters, 3);
            Assert.Equal(6, responses.Count);

            var response = responses[0];
            //Assert
            Assert.Equal("https://testApi.com/api/createEntity/accountId123", response.API);
            Assert.Equal("POST", response.MethodType);
            Assert.Equal(expectedBody, response.RequestBody);
            Assert.Equal("{\"templateId\":\"sada7s84544\"}", response.Response);
            Assert.Equal("Teststep", response.StepName);

            var expectedBody2 = JToken.Parse("{\"document\" : { \"templateId\": \"sada7s84544\", \"name\": \"val3\"}}").ToString();
            var response2 = responses[1];
            //Assert
            Assert.Equal("https://testApi.com/api/createEntity/sada7s84544", response2.API);
            Assert.Equal("POST", response2.MethodType);
            Assert.Equal(expectedBody2, response2.RequestBody);
            Assert.Equal("{\"templateId\":\"sada7s84544\"}", response2.Response);
            Assert.Equal("Teststep2", response2.StepName);
        }

        [Fact]
        public async Task ExecuteScenario_SeveralSteps_OneStepFailed_ExecutionOfOtherStepsStops()
        {
            //Arrange
            var scenarioNumber = 1;
            var parameters = "[{\"name\": \"Vas\", \"stepName\": \"TestStep\"}]";
            _mockMessageHandler.Reset();

            _mockMessageHandler.Protected()
               .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
               .ReturnsAsync((HttpRequestMessage a, CancellationToken b) =>
               {
                   return new HttpResponseMessage
                   {
                       StatusCode = HttpStatusCode.BadRequest
                   };
               });

            _mockDocuSignApiManifestProvider.Setup(_ => _.GetScenarioByNumber(It.IsAny<int>())).ReturnsAsync(new Scenario
            {
                Steps = new Step[2] {
                    new Step {
                        Name = "Teststep",
                        ParametersPrompts = new ParametersPrompt[1]
                        {
                            new ParametersPrompt {Name="Name", RequestParameterPath = "user.name", RequestParameterType = "Body" },
                        },
                        Request = new Request
                        {
                            Method = "POST",
                            Api = "https://testApi.com/api/createEntity/{accountId}",
                            BodyTemplate = JToken.Parse("{\"user\" : { \"name\": \"[name]\", \"email\": \"val2\"}}"),
                            Parameters = new Parameter[1]
                            {
                                new Parameter
                                {
                                    RequestParameterPath = "accountId",
                                    Source = string.Empty,
                                    In = "Path"
                                }
                            }
                        }
                    },
                    new Step {
                        Name = "Teststep2",
                        Request = new Request
                        {
                            Method = "POST",
                            Api = "https://testApi.com/api/createEntity/{templateId}",
                            BodyTemplate = JToken.Parse("{\"document\" : { \"templateId\": \"[id]\", \"name\": \"val3\"}}"),
                            Parameters = new Parameter[2]
                            {
                                new Parameter
                                {
                                    Name = "templIdBody",
                                    RequestParameterPath = "document.templateId",
                                    ResponseParameterPath = "templateId",
                                    Source = "Teststep",
                                    In = "Body"
                                },
                                new Parameter
                                {
                                    Name = "templateId",
                                    ResponseParameterPath = "templateId",
                                    Source = "Teststep",
                                    In = "Path"
                                }
                            }
                        }
                    }
                }
            });

            var expectedBody = JToken.Parse("{\"user\" : { \"name\": \"Vas\", \"email\": \"val2\"}}").ToString();

            //Act
            var responses = await _executeScenarioService.ExecuteScenario(scenarioNumber, parameters, 1);
            Assert.Equal(1, responses.Count);
            var response = responses[0];
            //Assert
            Assert.Equal("https://testApi.com/api/createEntity/accountId123", response.API);
            Assert.Equal("POST", response.MethodType);
            Assert.Equal(expectedBody, response.RequestBody);
            Assert.Equal(String.Empty, response.Response);
            Assert.Equal("Teststep", response.StepName);
            Assert.Equal(HttpStatusCode.BadRequest, response.ResponseCode);
        }
    }
}
