namespace AngularAuthAPI.Models
{
    public class Author
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public virtual List<Book> Auth_books { get; set; }
    }
}
