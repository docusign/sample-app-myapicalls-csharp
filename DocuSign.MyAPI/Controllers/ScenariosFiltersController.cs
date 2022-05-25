using DocuSign.MyAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace DocuSign.MyAPI.Controllers;

[ApiController]
[Route("api/filter")]
public class ScenariosFiltersController : ControllerBase
{ 
    private readonly ILogger<ScenariosFiltersController> _logger;
    private readonly IScenariosService _docuSignApiRepository;

    public ScenariosFiltersController(ILogger<ScenariosFiltersController> logger, IScenariosService docuSignApiRepository)
    {
        _logger = logger;
        _docuSignApiRepository = docuSignApiRepository;
    }

    [HttpGet]
    [Route("categories")]
    public async Task<ActionResult> GetCategories()
    {
        var categories = await _docuSignApiRepository.GetCategoriesFilters();
       return Ok(categories);
    }

    [HttpGet]
    [Route("areas")]
    public async Task<ActionResult> GetAreas()
    {
        var areas = await _docuSignApiRepository.GetAreasFilters();
        return Ok(areas);
    }
}
