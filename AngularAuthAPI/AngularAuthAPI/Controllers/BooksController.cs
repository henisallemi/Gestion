using AngularAuthAPI.Models;
using AngularAuthAPI.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AngularAuthAPI.Controllers
{
    [ApiController]
    [Route("[controller]")] 
    public class BooksController : ControllerBase
    {
        private readonly IBookRepo _bookRepo;

        public BooksController(IBookRepo bookRepo)
        {
            _bookRepo = bookRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetBooks()
        {
            var books = await _bookRepo.GetBooksAsync();
            return Ok(books);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            try
            {
                var books = await _bookRepo.UploadBooksFromFileAsync(file);
                return Ok(books);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddBook([FromBody] Book book)
        {
            if (book == null)
                return BadRequest("Invalid book object.");

            var addedBook = await _bookRepo.AddBookAsync(book);
            return Ok(addedBook);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            await _bookRepo.DeleteBookAsync(id);
            return Ok(new { message = "Book deleted successfully." });
        }

     


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBook(int id, [FromBody] Book updatedBook)
        {
            if (updatedBook == null)
                return BadRequest("Invalid book data.");

            var books = await _bookRepo.GetBooksAsync();
            var book = books.FirstOrDefault(b => b.Id == id);
            if (book == null)
                return NotFound();

            book.Title = updatedBook.Title;
            book.Author = updatedBook.Author;
            book.ISBN = updatedBook.ISBN;
            book.Genre = updatedBook.Genre;
            book.DatePublication = updatedBook.DatePublication;
            book.Editeur = updatedBook.Editeur;
            book.Langue = updatedBook.Langue;
            book.Description = updatedBook.Description;
            book.Nb_Page = updatedBook.Nb_Page;
            book.Prix = updatedBook.Prix;

            var updated = await _bookRepo.UpdateBookAsync(book);
            return Ok(updated);
        }

        [HttpGet("check-isbn/{isbn}")]
        public async Task<IActionResult> CheckIsbnExists(string isbn)
        {
            var bookExists = await _bookRepo.CheckIsbnExistsAsync(isbn);
            return Ok(bookExists);
        }

        [HttpGet("genres")] 
        public async Task<IActionResult> GetBooksByGenre()
        {
            var genreGroups = await _bookRepo.GetBooksByGenreAsync();

            if (genreGroups == null || !genreGroups.Any())
                return NotFound("No genres found.");

            return Ok(genreGroups);
        }
        [HttpGet("books-by-year")]
        public async Task<IActionResult> GetBooksByYear()
        {
            var yearGroups = await _bookRepo.GetBooksByYearAsync();

            if (yearGroups == null || !yearGroups.Any())
                return NotFound("No data found.");

            return Ok(yearGroups);
        }


        [HttpGet("books-by-publisher")]
        public async Task<IActionResult> GetBooksByPublisher()              
        {
            var publisherGroups = await _bookRepo.GetBooksByPublisherAsync();

            if (publisherGroups == null || !publisherGroups.Any())
                return NotFound("No publishers found.");    

            return Ok(publisherGroups);
        }
        [HttpGet("books-by-author-and-year")]
        public async Task<IActionResult> GetBooksByAuthorAndYear()
        {
            var authorYearGroups = await _bookRepo.GetBooksByAuthorAndYearAsync();

            if (authorYearGroups == null || !authorYearGroups.Any())
                return NotFound("No data found.");

            return Ok(authorYearGroups);
        }

         
    }
}
