using System.Text.Json.Serialization;

namespace DocuSign.MyAPI.Models
{
    public class UserInfo
    {
        [JsonPropertyName("accounts")]
        public IEnumerable<UserAccount> Accounts { get; set; }
    }
}
