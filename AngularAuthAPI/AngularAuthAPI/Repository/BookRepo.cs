using AngularAuthAPI.Context;
using AngularAuthAPI.Models;
using Aspose.Cells;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace AngularAuthAPI.Repository
{
    public class BookRepo : IBookRepo
    {
        private readonly AppDbContext _context;

        public BookRepo(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Book>> GetBooksAsync()
        {
            return await _context.Books.ToListAsync();
        }

        public async Task<Book> AddBookAsync(Book book)
        {
            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return book;
        }

        public async Task<Book> UpdateBookAsync(Book book)
        {
            _context.Books.Update(book);
            await _context.SaveChangesAsync();
            return book;
        }

        public async Task DeleteBookAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book != null)
            {
                _context.Books.Remove(book);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> CheckIsbnExistsAsync(string isbn)
        {
            return await _context.Books.AnyAsync(b => b.ISBN == isbn);
        }

        public async Task<IEnumerable<Book>> UploadBooksFromFileAsync(IFormFile file)
        {
            var books = new List<Book>();

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                stream.Position = 0;

                var workbook = new Workbook(stream);
                var worksheet = workbook.Worksheets[0];
                var cells = worksheet.Cells;

                var headers = new List<string>();
                for (int col = 0; col <= cells.MaxDataColumn; col++)
                {
                    headers.Add(cells[0, col].StringValue.ToLower());
                }

                for (int row = 1; row <= cells.MaxDataRow; row++)
                {
                    var book = new Book();
                    bool isTitleEmpty = true;
                    bool isPriceEmpty = true;

                    for (int col = 0; col <= cells.MaxDataColumn; col++)
                    {
                        var cellValue = cells[row, col].StringValue;
                        switch (headers[col])
                        {
                            case "title":
                            case "titre":
                            case "titr":
                                if (!string.IsNullOrEmpty(cellValue))
                                {
                                    book.Title = cellValue;
                                    isTitleEmpty = false;
                                }
                                break;
                            case "author":
                            case "auteur":
                                book.Author = cellValue;
                                break;
                            case "isbn":
                                book.ISBN = cellValue;
                                break;
                            case "genre":
                                book.Genre = cellValue;
                                break;
                            case "datepublication":
                            case "date_publication":
                            case "date":
                                book.DatePublication = cellValue;
                                break;
                            case "editeur":
                                book.Editeur = cellValue;
                                break;
                            case "langue":
                                book.Langue = cellValue;
                                break;
                            case "description":
                                book.Description = cellValue;
                                break;
                            case "nb_Page":
                            case "pages":
                                if (int.TryParse(cellValue, out int nbPages))
                                    book.Nb_Page = nbPages;
                                break;
                            case "prix":
                            case "price":
                                if (float.TryParse(cellValue, out float prix))
                                {
                                    book.Prix = prix;
                                    isPriceEmpty = false;
                                }
                                break;
                        }
                    }

                    if (isTitleEmpty || isPriceEmpty)
                    {
                        throw new ArgumentException("Please fill in the Title or Price fields for all books in the uploaded file.");
                    }

                    books.Add(book);
                }
            }

            await _context.Books.AddRangeAsync(books);
            await _context.SaveChangesAsync();

            return books;
        }
    }
}
            