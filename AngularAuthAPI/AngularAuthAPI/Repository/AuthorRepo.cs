﻿using AngularAuthAPI.Context;
using AngularAuthAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AngularAuthAPI.Repository
{
    public class authorRepo : IAuthorRepo
    {
        private readonly AppDbContext _context;

        public authorRepo(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Author>> GetAllAuthorsAsync()
        {
            return await _context.Authors.ToListAsync();
        }

        public async Task<Author> GetAuthorByIdAsync(int id)
        {
            return await _context.Authors.FindAsync(id);
        }

        public async Task<Author> GetAuthorByNameAsync(string name)
        {
            // Perform a case-insensitive comparison by converting both sides to lowercase
            return await _context.Authors
                .Where(a => a.Name.ToLower() == name.ToLower())
                .FirstOrDefaultAsync();
        }


        public async Task<int> CreateAuthorAsync(string name)
        {
            var author = new Author { Name = name };
            _context.Authors.Add(author);
            await _context.SaveChangesAsync();
            return author.Id;
        }

        public async Task UpdateAuthorAsync(Author author)
        {
            _context.Authors.Update(author);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAuthorAsync(int id)
        {
            var author = await GetAuthorByIdAsync(id);
            if (author != null)
            {
                _context.Authors.Remove(author);
                await _context.SaveChangesAsync();
            }
        }
    }

}
