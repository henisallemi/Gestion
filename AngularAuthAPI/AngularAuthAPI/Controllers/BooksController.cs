﻿using AngularAuthAPI.Context;
using Aspose.Cells;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Text;

namespace AngularAuthAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<BooksController> _logger;
        private readonly IConfiguration _configuration;

        public BooksController(ILogger<BooksController> logger, IConfiguration configuration, AppDbContext context)
        {
            _logger = logger;
            _configuration = configuration;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Book>>> GetBooks()
        {
            var books = await _context.Books.ToListAsync();
            return Ok(books);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            string filePath = Path.GetTempFileName();

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var workbook = new Workbook(filePath);
            var worksheet = workbook.Worksheets[0];
            var cells = worksheet.Cells;
            var dt = new DataTable();

            for (int col = 0; col <= cells.MaxColumn; col++)
            {
                string columnName = cells[0, col].StringValue;
                DataColumn column = dt.Columns.Add(columnName);

                for (int row = 1; row <= cells.MaxRow; row++)
                {
                    string cellValue = cells[row, col].StringValue;

                    if (!string.IsNullOrWhiteSpace(cellValue))
                    {
                        if (DateOnly.TryParse(cellValue, out _))
                        {
                            column.DataType = typeof(DateOnly);
                            break;
                        }
                        else if (double.TryParse(cellValue, out _))
                        {
                            column.DataType = typeof(double);
                            break;
                        }
                    }
                }

                column.DataType ??= typeof(string);
            }

            string tableName = "Books";
            string conString = _configuration.GetConnectionString("SqlServerConnStr");
            using var connection = new SqlConnection(conString);
            connection.Open();

            var checkTableCmd = new SqlCommand($"IF OBJECT_ID(N'{tableName}', N'U') IS NOT NULL SELECT 1 ELSE SELECT 0", connection);
            bool tableExists = (int)checkTableCmd.ExecuteScalar() == 1;

            if (!tableExists)
            {
                CreateTable(connection, tableName, dt);
                GenerateClassCode("Book", dt);
            }
            else
            {
                var existingColumns = new List<string>();
                var getColumnsCmd = new SqlCommand($"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{tableName}'", connection);
                using (var reader = getColumnsCmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        existingColumns.Add(reader.GetString(0));
                    }
                }

                var newColumns = new List<string>();
                foreach (DataColumn column in dt.Columns)
                {
                    if (!existingColumns.Contains(column.ColumnName))
                    {
                        AddColumnToTable(connection, tableName, column);
                        newColumns.Add(column.ColumnName);
                    }
                }

                if (newColumns.Count > 0)
                {
                    GenerateClassCode("Book", dt);
                    InsertDataIntoTable(connection, tableName, cells, dt);
                }
            }

            InsertDataIntoTable(connection, tableName, cells, dt);

            var books = await _context.Books.ToListAsync();
            return Ok(books);
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

        [HttpPost("add")]
        public async Task<IActionResult> AddBook([FromBody] Book book)
        {
            if (book == null)
                return BadRequest("Invalid book object.");

            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return Ok(book);
        }

        private static void CreateTable(SqlConnection connection, string tableName, DataTable dt)
        {
            string sqlScript = $"CREATE TABLE {tableName} (\n";
            sqlScript += "    Id INT IDENTITY(1,1) PRIMARY KEY,\n";

            foreach (DataColumn column in dt.Columns)
            {
                string sqlDataType = GetSqlDataType(column.DataType);
                sqlScript += $"    [{column.ColumnName}] {sqlDataType},\n";
            }

            sqlScript = sqlScript.Substring(0, sqlScript.Length - 2);
            sqlScript += $")";

            SqlCommand createCmd = new SqlCommand(sqlScript, connection);
            createCmd.ExecuteNonQuery();
        }

        private static void AddColumnToTable(SqlConnection connection, string tableName, DataColumn column)
        {
            string sqlDataType = GetSqlDataType(column.DataType);
            var alterTableCmd = new SqlCommand($"ALTER TABLE {tableName} ADD [{column.ColumnName}] {sqlDataType}", connection);
            alterTableCmd.ExecuteNonQuery();
        }

        private static void InsertDataIntoTable(SqlConnection connection, string tableName, Cells cells, DataTable dt)
        {
            for (int row = 1; row <= cells.MaxRow; row++)
            {
                var insertCommand = new StringBuilder();
                insertCommand.Append($"INSERT INTO {tableName} (");

                foreach (DataColumn column in dt.Columns)
                {
                    insertCommand.Append($"[{column.ColumnName}], ");
                }

                insertCommand.Length -= 2;
                insertCommand.Append(") VALUES (");

                foreach (DataColumn column in dt.Columns)
                {
                    string cellValue = cells[row, column.Ordinal].StringValue;
                    insertCommand.Append($"'{cellValue}', ");
                }

                insertCommand.Length -= 2;
                insertCommand.Append(")");

                using var insertCmd = new SqlCommand(insertCommand.ToString(), connection);
                insertCmd.ExecuteNonQuery();
            }
        }

        static string GetSqlDataType(Type dataType)
        {
            return dataType == typeof(int) ? "INT" :
                   dataType == typeof(double) ? "FLOAT" :
                   dataType == typeof(DateOnly) ? "DATE" : "NVARCHAR(MAX)";
        }

        private void GenerateClassCode(string className, DataTable dt)
        {
            var sb = new StringBuilder();
            sb.AppendLine($"public class {className}");
            sb.AppendLine("{");
            sb.AppendLine("    public int Id { get; set; }");

            foreach (DataColumn column in dt.Columns)
            {
                sb.AppendLine($"    public {GetCSharpDataType(column.DataType)}? {column.ColumnName} {{ get; set; }}");
            }

            sb.AppendLine("}");
            string classCode = sb.ToString();

            string classFilePath = Path.Combine(Directory.GetCurrentDirectory(), "Models", $"{className}.cs");
            Directory.CreateDirectory(Path.GetDirectoryName(classFilePath));
            System.IO.File.WriteAllText(classFilePath, classCode);
        }

        static string GetCSharpDataType(Type dataType)
        {
            return dataType == typeof(int) ? "int" :
                   dataType == typeof(double) ? "double" :
                   dataType == typeof(DateOnly) ? "DateOnly" : "string";
        }


        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateBook(int id, [FromBody] Book updatedBook)
        {
            if (updatedBook == null)
            {
                return BadRequest("Objet livre invalide.");
            }

            var existingBook = await _context.Books.FindAsync(id);
            if (existingBook == null)
            {
                return NotFound("Livre non trouvé.");
            }

            // Utiliser la réflexion pour mettre à jour les propriétés de l'objet existant
            var properties = typeof(Book).GetProperties();
            foreach (var property in properties)
            {
                var newValue = property.GetValue(updatedBook);
                if (newValue != null)
                {
                    property.SetValue(existingBook, newValue);
                }
            }
            existingBook.Id=id;
            _context.Books.Update(existingBook);
            await _context.SaveChangesAsync();

            return Ok(existingBook);
        }

    }
}
