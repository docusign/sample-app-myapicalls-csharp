using System.Text.Json.Serialization;

namespace DocuSign.MyAPI.Models
{
    public class UserInfo
    {
        [JsonPropertyName("accounts")]
        public IEnumerable<UserAccount> Accounts { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }
    }
}
