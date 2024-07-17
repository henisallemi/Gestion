using AngularAuthAPI.Models;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AngularAuthAPI.Repository
{
    public interface IBookRepo
    {
        Task<IEnumerable<Book>> GetBooksAsync();
        Task<Book> AddBookAsync(Book book);
        Task<Book> UpdateBookAsync(Book book);
        Task DeleteBookAsync(int id);
        Task<bool> CheckIsbnExistsAsync(string isbn);
        Task<IEnumerable<Book>> UploadBooksFromFileAsync(IFormFile file);
    }
}        