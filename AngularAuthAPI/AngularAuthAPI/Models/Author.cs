using System.Text.Json.Serialization;

namespace AngularAuthAPI.Models
{
    public class Author
    {
        public int Id { get; set; }

        public string Name { get; set; }

        [JsonIgnore]
        public virtual ICollection<Book> Auth_books { get; set; }
    }
}
