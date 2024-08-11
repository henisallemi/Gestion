using AngularAuthAPI.Repository;
using Microsoft.AspNetCore.Mvc;

namespace AngularAuthAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthorController : ControllerBase
    {
        private readonly IAuthorRepo _authorRepo;

        public AuthorController(IAuthorRepo authorRepo)
        {
            _authorRepo = authorRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAuthors()
        {
            try
            {
                var authors = await _authorRepo.GetAllAuthorsAsync();
                return Ok(authors);
            }
            catch (Exception ex)
            {
                // Log exception
                // Example: _logger.LogError(ex, "An error occurred while retrieving authors.");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAuthorById(int id)
        {
            var author = await _authorRepo.GetAuthorByIdAsync(id);
            if (author == null)
                return NotFound();

            return Ok(author);
        }

        [HttpGet("name/{name}")]
        public async Task<IActionResult> GetAuthorByName(string name)
        {
            var author = await _authorRepo.GetAuthorByNameAsync(name);
            if (author == null)
                return NotFound();

            return Ok(author);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAuthor([FromBody] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return BadRequest("Invalid author name.");

            var authorId = await _authorRepo.CreateAuthorAsync(name);
            return CreatedAtAction(nameof(GetAuthorById), new { id = authorId }, new { id = authorId, name });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAuthor(int id, [FromBody] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return BadRequest("Invalid author name.");

            var author = await _authorRepo.GetAuthorByIdAsync(id);
            if (author == null)
                return NotFound();

            author.Name = name;
            await _authorRepo.UpdateAuthorAsync(author);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAuthor(int id)
        {
            await _authorRepo.DeleteAuthorAsync(id);
            return NoContent();
        }
    }

}
