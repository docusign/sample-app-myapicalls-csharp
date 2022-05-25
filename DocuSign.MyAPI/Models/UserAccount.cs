using System.Text.Json.Serialization;

namespace DocuSign.MyAPI.Models
{
    public class UserAccount
    {
        [JsonPropertyName("account_id")]
        public string Id { get; set; }
    }
}
