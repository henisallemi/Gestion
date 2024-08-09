using AngularAuthAPI.Context;
using AngularAuthAPI.Models;
using Aspose.Cells;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SkiaSharp;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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
            return await _context.Books.Include(b => b.Auth).ToListAsync();
        }

        public async Task<IEnumerable<Author>> GetAuthorsAsync()
        {
            return await _context.Authors.ToListAsync();
        }

        public async Task<Book> AddBookAsync(Book newBook, string authorName)
        {
            // Check if the author exists
            var author = await _context.Authors
                .FirstOrDefaultAsync(a => a.Name == authorName);

            // If the author does not exist, create a new one
            if (author == null)
            {
                author = new Author { Name = authorName };
                _context.Authors.Add(author);
                await _context.SaveChangesAsync();
            }

            // Set the book's author ID and reference
            newBook.Id_Auth = author.Id;
            newBook.Auth = author;

            // Add the book to the database
            _context.Books.Add(newBook);
            await _context.SaveChangesAsync();

            return newBook;
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
            var newAuthors = new List<Author>();

            try
            {
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

                    var existingAuthors = await _context.Authors.ToListAsync();

                    for (int row = 1; row <= cells.MaxDataRow; row++)
                    {
                        var book = new Book();
                        bool isTitleEmpty = true;
                        bool isPriceEmpty = true;

                        Author author = null;
                        int? authorId = null;

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
                                    if (!string.IsNullOrEmpty(cellValue))
                                    {
                                        var lowerCellValue = cellValue.ToLower();
                                        author = existingAuthors.FirstOrDefault(a => a.Name.ToLower() == lowerCellValue);

                                        if (author == null)
                                        {
                                            author = new Author
                                            {
                                                Name = cellValue,
                                                Auth_books = new List<Book>()
                                            };
                                            newAuthors.Add(author);
                                        }

                                        authorId = author.Id;
                                        book.Auth = author;
                                        book.Id_Auth = authorId.Value;
                                        author.Auth_books.Add(book);
                                    }
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
                                case "nb_page":
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
                            // Log warning or error and continue processing other books
                            // Example: _logger.LogWarning($"Book at row {row} has missing title or price.");
                            continue;
                        }

                        books.Add(book);
                    }
                }

                if (newAuthors.Any())
                {
                    await _context.Authors.AddRangeAsync(newAuthors);
                }

                await _context.Books.AddRangeAsync(books);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log exception
                // Example: _logger.LogError(ex, "An error occurred while uploading books.");
                throw;
            }

            return books;
        }


        public async Task<IEnumerable<GenrePercentage>> GetBooksByGenreAsync()
        {
            var books = await _context.Books.ToListAsync();

            if (books == null || !books.Any())
                return Enumerable.Empty<GenrePercentage>();

            var totalBooks = books.Count();

            var genreGroups = books
                .GroupBy(b => b.Genre)
                .Select(g => new GenrePercentage
                {
                    GenreName = g.Key,
                    Percentage = (float)Math.Round((g.Count() / (float)totalBooks) * 100, 2) // Convertir le résultat en float
                })
                .ToList();

            // Ajuster le pourcentage final pour garantir que le total est 100%
            var totalPercentage = genreGroups.Sum(g => g.Percentage);
            if (totalPercentage < 100)
            {
                var lastGenre = genreGroups.Last();
                genreGroups.Remove(lastGenre);
                genreGroups.Add(new GenrePercentage
                {
                    GenreName = lastGenre.GenreName,
                    Percentage = (float)Math.Round(lastGenre.Percentage + (100 - totalPercentage), 2) // Convertir le résultat en float
                });
            }

            return genreGroups;
        }

        public async Task<IEnumerable<YearGroup>> GetBooksByYearAsync()
        {
            var books = await _context.Books.ToListAsync();

            if (books == null || !books.Any())
                return Enumerable.Empty<YearGroup>();

            // Convert DatePublication to just the year
            var yearGroups = books
                .GroupBy(b =>
                {
                    // Attempt to parse DatePublication into DateTime
                    if (DateTime.TryParse(b.DatePublication, out DateTime date))
                    {
                        return date.Year.ToString(); // Return the year as a string
                    }
                    return "Unknown"; // Handle unexpected format
                })
                .Where(g => g.Key != "Unknown") // Exclude unknown formats
                .Select(g => new YearGroup
                {
                    PublicationYear = g.Key,
                    Percentage = (float)Math.Round((g.Count() / (float)books.Count()) * 100, 2)
                })
                .OrderBy(y => y.PublicationYear)
                .ToList();

            // Adjust percentages to ensure the total is 100%
            var totalPercentage = yearGroups.Sum(g => g.Percentage);
            if (totalPercentage < 100)
            {
                // Adjust the last year's percentage to ensure the total is 100%
                var lastYear = yearGroups.Last();
                yearGroups.Remove(lastYear);
                yearGroups.Add(new YearGroup
                {
                    PublicationYear = lastYear.PublicationYear,
                    Percentage = (float)Math.Round(lastYear.Percentage + (100 - totalPercentage), 2)
                });
            }

            return yearGroups;
        }

        public async Task<IEnumerable<PublisherGroup>> GetBooksByPublisherAsync()
        {
            var booksCount = await _context.Books.CountAsync();

            if (booksCount == 0)
            {
                return Enumerable.Empty<PublisherGroup>();
            }

            var publisherGroups = await _context.Books
                .GroupBy(b => b.Editeur)
                .Select(g => new PublisherGroup
                {
                    PublisherName = g.Key,
                    Percentage = Math.Round((g.Count() * 100.0) / booksCount, 2)
                })
                .ToListAsync();

            // Adjust percentages to ensure the total is 100%
            var totalPercentage = publisherGroups.Sum(g => g.Percentage);
            if (totalPercentage < 100)
            {
                var difference = 100 - totalPercentage;
                var lastPublisher = publisherGroups.Last();
                publisherGroups.Remove(lastPublisher);
                publisherGroups.Add(new PublisherGroup
                {
                    PublisherName = lastPublisher.PublisherName,
                    Percentage = Math.Round(lastPublisher.Percentage + difference, 2)
                });
            }

            return publisherGroups;
        }

        public async Task<IEnumerable<AuthorYearGroup>> GetBooksByAuthorAndYearAsync()
        {
            var books = await _context.Books.ToListAsync();

            if (books == null || !books.Any())
                return Enumerable.Empty<AuthorYearGroup>();

            var authorYearGroups = books
                .GroupBy(b => new { b.Auth.Name, Year = DateTime.TryParse(b.DatePublication, out DateTime date) ? date.Year.ToString() : "Unknown" })
                .Where(g => g.Key.Year != "Unknown") // Exclure les formats inconnus
                .Select(g => new AuthorYearGroup
                {
                    Author = g.Key.Name,
                    PublicationYear = g.Key.Year,
                    Count = g.Count()
                })
                .OrderBy(a => a.Author)
                .ThenBy(a => a.PublicationYear)
                .ToList(); 

            return authorYearGroups;
        }







    }
}
