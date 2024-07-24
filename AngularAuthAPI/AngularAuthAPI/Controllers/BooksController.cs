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

            string tableName = "Books"; // Using "Books" as the table name
            string conString = _configuration.GetConnectionString("SqlServerConnStr");
            using var connection = new SqlConnection(conString);
            connection.Open();

            // Check if the table already exists
            var checkTableCmd = new SqlCommand($"IF OBJECT_ID(N'{tableName}', N'U') IS NOT NULL SELECT 1 ELSE SELECT 0", connection);
            bool tableExists = (int)checkTableCmd.ExecuteScalar() == 1;

            if (!tableExists)
            {
                // Generate SQL script for creating the table
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
                SqlCommand createCmd = new SqlCommand(sqlScript, connection);
                createCmd.ExecuteNonQuery();
            }
            else
            {
                // Get existing columns from the table
                var existingColumns = new List<string>();
                var getColumnsCmd = new SqlCommand($"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{tableName}'", connection);
                using (var reader = getColumnsCmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        existingColumns.Add(reader.GetString(0));
                    }
                }

                // Add new columns if they don't exist in the table
                var newColumns = new List<string>();
                foreach (DataColumn column in dt.Columns)
                {
                    if (!existingColumns.Contains(column.ColumnName))
                    {
                        string sqlDataType = GetSqlDataType(column.DataType);
                        var alterTableCmd = new SqlCommand($"ALTER TABLE {tableName} ADD [{column.ColumnName}] {sqlDataType}", connection);
                        alterTableCmd.ExecuteNonQuery();
                        newColumns.Add(column.ColumnName);
                    }
                }

                if (newColumns.Count > 0)
                {
                    return Ok($"New columns added successfully: {string.Join(", ", newColumns)}");
                }
            }

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

            return Ok("Data inserted successfully.");
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
