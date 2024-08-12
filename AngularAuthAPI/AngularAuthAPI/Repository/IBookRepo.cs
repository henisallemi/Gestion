using AngularAuthAPI.Models;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AngularAuthAPI.Repository
{
    public interface IBookRepo
    {
        Task<IEnumerable<Book>> GetBooksAsync();
        Task<Book> AddBookAsync(Book book, string authorName);
        Task<Book> UpdateBookAsync(Book book);
        Task<Book> GetBookByIdAsync(int id);
        Task DeleteBookAsync(int id);
        Task<bool> CheckIsbnExistsAsync(string isbn);
        Task<IEnumerable<Book>> UploadBooksFromFileAsync(IFormFile file);
        Task<IEnumerable<GenrePercentage>> GetBooksByGenreAsync();
        Task<IEnumerable<YearGroup>> GetBooksByYearAsync(); // Add this method
        Task<IEnumerable<PublisherGroup>> GetBooksByPublisherAsync();
        Task<IEnumerable<AuthorYearGroup>> GetBooksByAuthorAndYearAsync(); 

    }
}        