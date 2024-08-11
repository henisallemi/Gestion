using AngularAuthAPI.Models;

namespace AngularAuthAPI.Repository
{
    public interface IAuthorRepo
    {
        Task<IEnumerable<Author>> GetAllAuthorsAsync();
        Task<Author> GetAuthorByIdAsync(int id);
        Task<Author> GetAuthorByNameAsync(string name);
        Task<int> CreateAuthorAsync(string name);
        Task UpdateAuthorAsync(Author author);
        Task DeleteAuthorAsync(int id);
    }

}
