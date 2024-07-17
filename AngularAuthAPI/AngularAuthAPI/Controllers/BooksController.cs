using AngularAuthAPI.Context;
using AngularAuthAPI.Models;
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
        public IActionResult Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Upload a valid file");

            using (var stream = new MemoryStream())
            {
                file.CopyTo(stream);

                // Load the workbook
                var workbook = new Workbook(stream);
                var worksheet = workbook.Worksheets[0];
                var cells = worksheet.Cells;

                var columnNames = new List<string>();

                // Assuming the first row contains the column names
                for (int col = 0; col < cells.MaxColumn + 1; col++)
                {
                    columnNames.Add(cells[0, col].StringValue);
                }

                // Generate the Book model class
                ModelGenerator.GenerateBookModel(columnNames);
            }

            return Ok(new { Message = "File processed successfully" });
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

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var book = await _context.Books.FindAsync(id);
        if (book == null)
        {
            return NotFound();
        }

        _context.Books.Remove(book);
        await _context.SaveChangesAsync();

        return NoContent();
    }

} 
