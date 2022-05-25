using DocuSign.MyAPI.Exceptions;
using DocuSign.MyAPI.Models;
using DocuSign.MyAPI.Services;

using Microsoft.AspNetCore.Mvc;

namespace DocuSign.MyAPI.Controllers;

[ApiController]
[Route("api/scenario")]
public class ScenariosController : ControllerBase
{
    private readonly IScenariosService _docuSignApiService;
    private readonly IExecuteScenarioService _executeScenarioService;

    public ScenariosController(IScenariosService docuSignApiRepository,
        IExecuteScenarioService executeScenarioService)
    {
        _docuSignApiService = docuSignApiRepository;
        _executeScenarioService = executeScenarioService;
    }

    [HttpGet]
    public async Task<ActionResult> GetScenarios()
    {
        Domain.ScenarioShortInfo[] scenarios = await _docuSignApiService.GetScenarios();
        return Ok(scenarios);
    }

    [HttpGet]
    [Route("{scenarioNumber:int}")]
    public async Task<ActionResult> GetScenarioInfo(int scenarioNumber)
    {
        Domain.ScenarioFullInfo scenario = await _docuSignApiService.GetScenarioInfo(scenarioNumber);
        return Ok(scenario);
    }

    [HttpGet]
    [Route("{scenarioNumber:int}/{stepName}")]
    public async Task<ActionResult> GetScenarioStepInfo(int scenarioNumber, string stepName)
    {
        Domain.ScenarioStepFullInfo stepFullInfo = await _docuSignApiService.GetScenarioStepInfo(scenarioNumber, stepName);
        return Ok(stepFullInfo);
    }

    [HttpPost]
    [Route("executeScenario")]
    public async Task<ActionResult<List<ExecutionResponse>>> ExecuteScenario(ExecuteScenarioModel model)
    {
        if (model.IterationCount > 10)
        {
            return ValidationProblem("Iteration count cannot be greater than 10.");
        }
        if (model.IterationCount < 1)
        {
            return ValidationProblem("Iteration count cannot be less than 1.");
        }

        try
        {
            IList<ExecutionResponse> responses = await _executeScenarioService.ExecuteScenario(model.ScenarioNumber, model.Parameters, model.IterationCount);

            return Ok(responses);
        }
        catch (NotFoundScenarioException ex)
        {
            return NotFound(ex.Message);
        }
        catch (NotFoundStepException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost]
    [Route("executeScenarioStep")]
    public async Task<ActionResult<ExecutionResponse>> ExecuteScenarioStep(ExecuteScenarioStepModel model)
    {
        try
        {
            var response = await _executeScenarioService.ExecuteScenarioStep(model.ScenarioNumber, model.StepName, model.Parameters, model.PreviousStepResponses);

            return Ok(response);
        }
        catch (NotFoundScenarioException ex)
        {
            return NotFound(ex.Message);
        }
        catch (NotFoundStepException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
