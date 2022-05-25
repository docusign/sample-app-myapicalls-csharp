using DocuSign.MyAPI.Exceptions;
using Microsoft.AspNetCore.Diagnostics;

using System.Net;
using System.Text.Json;

namespace GlobalErrorHandling.Extensions
{
    public static class ExceptionMiddlewareExtensions
    {
        public static void ConfigureExceptionHandling(this IApplicationBuilder app, ILogger logger)
        { 
            app.UseExceptionHandler(appError =>
            {
                appError.Run(async context =>
                {
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    context.Response.ContentType = "application/json";
                    var errorMessage = "Internal Server Error.";

                    var contextFeature = context.Features.Get<IExceptionHandlerFeature>();
                    if (contextFeature != null)
                    {
                        if (contextFeature.Error is ScenarioExecutionException scenarioExecutionException)
                        {
                            logger.LogError($"Error occured: {contextFeature.Error}");

                            context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                            errorMessage = scenarioExecutionException.Message;
                        }
                        if (contextFeature.Error is UnauthorizedAccessException exception)
                        {
                            logger.LogError($"Error occured: {contextFeature.Error}");

                            context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                        }
                        if (contextFeature.Error is HttpRequestException apiError)
                        {
                            logger.LogError($"Error occured during DocuSign api call: {contextFeature.Error}");

                            if (apiError.StatusCode == HttpStatusCode.Unauthorized)
                            {
                                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                            }
                        }
                        else
                        {
                            logger.LogError($"Error occured: {contextFeature.Error}");
                        }

                        await context.Response.WriteAsync(JsonSerializer.Serialize(new
                        {
                            status = context.Response.StatusCode,
                            message = errorMessage
                        }));
                    }
                });
            });
        }
    }
}