using AngularAuthAPI.Context;
using Aspose.Cells;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Text;

namespace AngularAuthAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HomeController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<HomeController> _logger;
        private readonly IConfiguration _configuration;

        public HomeController(ILogger<HomeController> logger, IConfiguration configuration, AppDbContext context)
        {
            _logger = logger;
            _configuration = configuration;
            _context = context;
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

            // Load Excel file using Aspose.Cells
            var workbook = new Workbook(filePath);
            var worksheet = workbook.Worksheets[0];
            var cells = worksheet.Cells;
            var dt = new DataTable();

            // Create table structure based on Excel header and infer data types
            for (int col = 0; col <= cells.MaxColumn; col++)
            {
                string columnName = cells[0, col].StringValue;
                DataColumn column = dt.Columns.Add(columnName);

                // Infer data type based on the values in the column
                for (int row = 1; row <= cells.MaxRow; row++)
                {
                    string cellValue = cells[row, col].StringValue;

                    if (!string.IsNullOrWhiteSpace(cellValue))
                    {
                        if (DateTime.TryParse(cellValue, out _))
                        {
                            column.DataType = typeof(DateTime);
                            break;
                        }
                        else if (double.TryParse(cellValue, out _))
                        {
                            column.DataType = typeof(double);
                            break;
                        }
                    }
                }

                // Set default data type if not inferred
                column.DataType ??= typeof(string);
            }

            // Generate SQL script for creating the table
            string tableName = "Books"; // Using "Books" as the table name
            string conString = _configuration.GetConnectionString("SqlServerConnStr");
            using var connection = new SqlConnection(conString);
            connection.Open();

            string sqlScript = $"CREATE TABLE {tableName} (\n";
            sqlScript += "    Id INT IDENTITY(1,1) PRIMARY KEY,\n"; // Add Id column with auto-increment

            foreach (DataColumn column in dt.Columns)
            {
                string sqlDataType = GetSqlDataType(column.DataType);
                sqlScript += $"    [{column.ColumnName}] {sqlDataType},\n";
            }

            // Remove the trailing comma and newline
            sqlScript = sqlScript.Substring(0, sqlScript.Length - 2);
            sqlScript += $")";

            // Execute the SQL script to create the table
            SqlCommand cmd = new SqlCommand(sqlScript, connection);
            cmd.ExecuteNonQuery();

            // Insert data into the table
            for (int row = 1; row <= cells.MaxRow; row++)
            {
                var insertCommand = new StringBuilder();
                insertCommand.Append($"INSERT INTO {tableName} (");

                for (int col = 0; col <= cells.MaxColumn; col++)
                {
                    string columnName = cells[0, col].StringValue;
                    insertCommand.Append($"[{columnName}], ");
                }

                // Remove the trailing comma and space
                insertCommand.Length -= 2;
                insertCommand.Append(") VALUES (");

                for (int col = 0; col <= cells.MaxColumn; col++)
                {
                    string cellValue = cells[row, col].StringValue;
                    insertCommand.Append($"'{cellValue}', ");
                }

                // Remove the trailing comma and space
                insertCommand.Length -= 2;
                insertCommand.Append(")");

                // Execute the insert command
                using var insertCmd = new SqlCommand(insertCommand.ToString(), connection);
                insertCmd.ExecuteNonQuery();
            }

            // Close the database connection
            connection.Close();

            // Generate C# class code
            string classCode = GenerateClassCode("Book", dt);

            // Save the class code to a file
            string classFilePath = Path.Combine(Directory.GetCurrentDirectory(), "Models", "Book.cs");
            Directory.CreateDirectory(Path.GetDirectoryName(classFilePath)); // Ensure directory exists
            System.IO.File.WriteAllText(classFilePath, classCode);

            return Ok("Table and class created successfully with data.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(double id)
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

        static string GetSqlDataType(Type dataType)
        {
            if (dataType == typeof(int))
            {
                return "INT";
            }
            else if (dataType == typeof(double))
            {
                return "FLOAT";
            }
            else if (dataType == typeof(DateTime))
            {
                return "DATETIME";
            }
            else
            {
                return "NVARCHAR(MAX)";
            }
        }

        private string GenerateClassCode(string className, DataTable dt)
        {
            var sb = new StringBuilder();
            sb.AppendLine($"public class {className}");
            sb.AppendLine("{");
            sb.AppendLine("    public int Id { get; set; }");

            foreach (DataColumn column in dt.Columns)
            {
                sb.AppendLine($"    public {GetCSharpDataType(column.DataType)} {column.ColumnName} {{ get; set; }}");
            }

            sb.AppendLine("}");
            return sb.ToString();
        }

        static string GetCSharpDataType(Type dataType)
        {
            if (dataType == typeof(int))
            {
                return "int";
            }
            else if (dataType == typeof(double))
            {
                return "double";
            }
            else if (dataType == typeof(DateTime))
            {
                return "DateTime";
            }
            else
            {
                return "string";
            }
        }
    }
}
