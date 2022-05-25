using AutoMapper;

namespace DocuSign.MyAPI.Domain
{
    public class ScenarioProfile : Profile
    {
        public ScenarioProfile()
        {
            CreateMap<Domain.ScenarioBase, ScenarioShortInfo>().ReverseMap();
            CreateMap<Domain.Scenario, ScenarioFullInfo>()
                .ForMember(dest => dest.Steps, src => src.MapFrom(sc => sc.Steps.Select(x => new ScenarioStep { Name = x.Name, Title = x.Title , ShortDescription = x.ShortDescription})))
                .ForMember(dest => dest.ParameterPrompts, src => src.MapFrom(sc => sc.Steps.SelectMany(m => m.ParametersPrompts.Select(p => new ParametersPromptFullInfo
                {
                    name = p.Name,
                    title = p.Title,
                    type = p.Type,
                    defaultValue = p.DefaultValue,
                    note = p.Note,
                    requestParameterPath = p.RequestParameterPath,
                    requestParameterType = p.RequestParameterType,
                    required = p.Required,
                    options = p.Options,
                    stepName = m.Name,
                }))));
        }
    }
}