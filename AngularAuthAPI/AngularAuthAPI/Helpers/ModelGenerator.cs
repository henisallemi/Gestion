using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Microsoft.EntityFrameworkCore;

public class ModelGenerator
{
    public static void GenerateBookModel(List<string> columnNames)
    {
        var sb = new StringBuilder();
        sb.AppendLine("namespace AngularAuthAPI.Models");
        sb.AppendLine("{");
        sb.AppendLine("    public class Book");
        sb.AppendLine("    {");

        sb.AppendLine("        [Key]");
        sb.AppendLine("        public int Id { get; set; }");

        foreach (var columnName in columnNames)
        {
            sb.AppendLine($"        public string {columnName} {{ get; set; }}");
        }

        sb.AppendLine("    }");
        sb.AppendLine("}");

        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Models", "Book.cs");

        // Ensure the directory exists
        var directory = Path.GetDirectoryName(filePath);
        if (!Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }

        // Write the file
        File.WriteAllText(filePath, sb.ToString());

        // Trigger Ansible playbook to update the database
        ExecuteAnsiblePlaybook();
    }

    private static void ExecuteAnsiblePlaybook()
    {
        try
        {
            var ansiblePath = "/path/to/ansible"; // Update with your Ansible path
            var playbookPath = "/path/to/migrate.yml"; // Path to your Ansible playbook

            var processInfo = new ProcessStartInfo
            {
                FileName = ansiblePath,
                Arguments = $"-i /path/to/hosts {playbookPath}",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using (var process = Process.Start(processInfo))
            {
                process.WaitForExit();

                // Capture output and error messages
                var output = process.StandardOutput.ReadToEnd();
                var error = process.StandardError.ReadToEnd();

                // Log or handle the output and error messages as needed
                Console.WriteLine($"Ansible Output: {output}");
                Console.WriteLine($"Ansible Error: {error}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error executing Ansible playbook: {ex.Message}");
            // Handle exceptions
        }
    }
}
