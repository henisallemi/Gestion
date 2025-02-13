﻿using AngularAuthAPI.Context; 
using Aspose.Cells;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

[ApiController]
[Route("[controller]")]
public class BooksController : ControllerBase
{
    private readonly AppDbContext _context;

    public BooksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetBooks()
    {
        var books = await _context.Books.ToListAsync();
        return Ok(books);
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

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
                for (int col = 0; col <= cells.MaxDataColumn; col++)
                {
                    var cellValue = cells[row, col].StringValue;
                    switch (headers[col])
                    {
                        case "title":
                        case "titre":
                        case "titr":
                            book.Title = cellValue;
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
                        case "nb_page":
                        case "pages":
                            if (int.TryParse(cellValue, out int nbPages))
                                book.Nb_Page = nbPages;
                            break;
                        case "prix":
                        case "price":
                            if (float.TryParse(cellValue, out float prix))
                                book.Prix = prix;    
                            break; 
                            // Add other properties as needed
                    }
                }
                books.Add(book);
            }
        }

        await _context.Books.AddRangeAsync(books);
        await _context.SaveChangesAsync();

        var x = await _context.Books.ToListAsync();

        return Ok(x);  
    }
    // Endpoint pour ajouter un seul livre
    [HttpPost("add")] 
    public async Task<IActionResult> AddBook([FromBody] Book book)
    {
        if (book == null)
            return BadRequest("Invalid book object.");

        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        return Ok(book);
    }
}
