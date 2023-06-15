using DocuSign.MyAPI;
using DocuSign.MyAPI.Models;
using DocuSign.MyAPI.Services;

using GlobalErrorHandling.Extensions;

using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Options;

using Newtonsoft.Json.Linq;

using System.Globalization;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHealthChecks();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// TODO: Investigate a secure way to include a link to swagger file in deployed application
// builder.Services.AddSwaggerGen();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IApiManifestProvider, ApiManifestProvider>();
builder.Services.AddHttpClient<IExecuteScenarioService, ExecuteScenarioService>();
builder.Services.AddScoped<IScenariosService, ScenariosService>();
builder.Services.AddScoped<IRandomGenerator, RandomGenerator>();

builder.Services.AddAutoMapper(System.AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddMemoryCache();
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = builder.Configuration["DocuSign:Schema"];
})
.AddOAuth(builder.Configuration["DocuSign:Schema"], options =>
{
    options.ClientId = builder.Configuration["DocuSign:IntegrationKey"];
    options.ClientSecret = builder.Configuration["DocuSign:SecretKey"];
    options.CallbackPath = new PathString(builder.Configuration["DocuSign:CallbackPath"]);
    options.AuthorizationEndpoint = builder.Configuration["DocuSign:AuthorizationEndpoint"];
    options.TokenEndpoint = builder.Configuration["DocuSign:TokenEndpoint"];
    options.UserInformationEndpoint = builder.Configuration["DocuSign:UserInformationEndpoint"];
    options.Scope.Add("signature");
    options.Scope.Add("click.manage");
    options.Scope.Add("click.send");
    options.Scope.Add("organization_read");
    options.Scope.Add("group_read");
    options.Scope.Add("permission_read");
    options.Scope.Add("user_read");
    options.Scope.Add("user_write");
    options.Scope.Add("account_read");
    options.Scope.Add("domain_read");
    options.Scope.Add("dtr.rooms.read");
    options.Scope.Add("dtr.rooms.write");
    options.Scope.Add("dtr.documents.read");
    options.Scope.Add("dtr.documents.write");
    options.Scope.Add("dtr.profile.read");
    options.Scope.Add("dtr.profile.write");
    options.Scope.Add("dtr.company.read");
    options.Scope.Add("dtr.company.write");
    options.Scope.Add("room_forms");
    options.Scope.Add("notary_write");
    options.Scope.Add("notary_read");

    options.SaveTokens = true;

    options.Events = new OAuthEvents
    {
        OnCreatingTicket = async context =>
        {
            var request = new HttpRequestMessage(HttpMethod.Get, context.Options.UserInformationEndpoint);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", context.AccessToken);

            var response = await context.Backchannel.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, context.HttpContext.RequestAborted);
            response.EnsureSuccessStatusCode();

            var user = JsonSerializer.Deserialize<UserInfo>(await response.Content.ReadAsStringAsync());
            var account = user.Accounts.FirstOrDefault(acc => acc.IsDefault);

            context.Identity.AddClaim(new Claim("accountId", account.Id, ClaimValueTypes.String));
        }
    };
})
.AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, config =>
{
    config.Cookie.Name = "UserLoginCookie";
    config.Cookie.HttpOnly = true;
    config.Cookie.SameSite = SameSiteMode.Lax;
    config.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    config.LoginPath = "/Account/Login";
    config.SlidingExpiration = true;
    config.ExpireTimeSpan = TimeSpan.FromMinutes(60);
    config.Events = new CookieAuthenticationEvents
    {
        // Check access token expiration and refresh if expired
        OnValidatePrincipal = context =>
        {
            if (context.Properties.Items.ContainsKey(".Token.expires_at"))
            {
                var expire = DateTime.Parse(context.Properties.Items[".Token.expires_at"]);
                if (expire < DateTime.Now)
                {
                    var authProperties = context.Properties;
                    var options = context.HttpContext.RequestServices
                        .GetRequiredService<IOptionsMonitor<OAuthOptions>>()
                        .Get("DocuSign");

                    var requestParameters = new Dictionary<string, string>
                    {
                        { "client_id", builder.Configuration["DocuSign:IntegrationKey"] },
                        { "client_secret", builder.Configuration["DocuSign:SecretKey"] },
                        { "grant_type", "refresh_token" },
                        { "refresh_token", authProperties.GetTokenValue("refresh_token") }
                    };

                    // Request new access token with refresh token
                    var refreshResponse = options.Backchannel.PostAsync(
                        options.TokenEndpoint,
                        new FormUrlEncodedContent(requestParameters),
                        context.HttpContext.RequestAborted).Result;
                    refreshResponse.EnsureSuccessStatusCode();

                    var payload = JObject.Parse(refreshResponse.Content.ReadAsStringAsync().Result);

                    // Persist the new access token and refresh token
                    authProperties.UpdateTokenValue("access_token", payload.Value<string>("access_token"));
                    authProperties.UpdateTokenValue("refresh_token", payload.Value<string>("refresh_token"));

                    if (int.TryParse(
                        payload.Value<string>("expires_in"),
                        NumberStyles.Integer,
                        CultureInfo.InvariantCulture, out var seconds))
                    {
                        var expiresAt = DateTimeOffset.UtcNow + TimeSpan.FromSeconds(seconds);
                        authProperties.UpdateTokenValue(
                            "expires_at",
                            expiresAt.ToString("o", CultureInfo.InvariantCulture));
                    }
                    context.ShouldRenew = true;
                }
            }
            return Task.FromResult(0);
        }
    };
});

var app = builder.Build();
app.ConfigureExceptionHandling(app.Logger);
// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
app.MapHealthChecks("/healthz");

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedProto
});
app.UseAuthentication();
app.UseAuthorization();

// TODO: Investigate a secure way to include a link to swagger file in deployed application
// app.UseSwagger();
// app.UseSwaggerUI();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");

app.Run();
