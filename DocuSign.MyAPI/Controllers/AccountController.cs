﻿using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DocuSign.MyAPI.Controllers
{
    [Route("[controller]")]
    public class AccountController : ControllerBase
    {
        [HttpGet]
        [Route("/api/account")]
        public async Task<ActionResult<String>> GetAccountId()
        {
            var accountId = HttpContext.User.FindFirst("accountId");
            var name = HttpContext.User.FindFirst("name");
            var email = HttpContext.User.FindFirst("email");

            return Ok(new
            {
                id = accountId == null ? string.Empty : accountId.Value,
                name = name == null ? String.Empty : name.Value,
                email = email == null ? String.Empty : email.Value
            });
        }

        [HttpGet]
        [Route("login")]
        public IActionResult Login(string returnUrl = "/")
        {
            if (string.IsNullOrEmpty(returnUrl) || !Url.IsLocalUrl(returnUrl))
            {
                returnUrl = "/";
            }
            
            return Challenge(new AuthenticationProperties() { RedirectUri = returnUrl, AllowRefresh = true });
        }

        [Authorize]
        [HttpGet]
        [Route("logout")]
        public async Task<IActionResult> Logout()
        {
            await AuthenticationHttpContextExtensions.SignOutAsync(HttpContext);
            return LocalRedirect("/");
        }
    }
}
