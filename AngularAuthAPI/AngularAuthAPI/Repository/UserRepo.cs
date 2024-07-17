using AngularAuthAPI.Context;
using AngularAuthAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace AngularAuthAPI.Repository
{
    public class UserRepo : IUserRepo 
    {
        private readonly AppDbContext _authContext;

        public UserRepo(AppDbContext authContext)
        {
            _authContext = authContext;
        }

        public async Task<User> AuthenticateAsync(User userObj)
        {
            return await _authContext.Users.FirstOrDefaultAsync(x => x.UserName == userObj.UserName);
        }

        public async Task<bool> CheckUserNameExistAsync(string username)
        {
            return await _authContext.Users.AnyAsync(x => x.UserName == username);
        }

        public async Task<bool> CheckEmailExistAsync(string email)
        {
            return await _authContext.Users.AnyAsync(x => x.Email == email);
        }

        public async Task RegisterUserAsync(User user)
        {
            await _authContext.Users.AddAsync(user);
            await _authContext.SaveChangesAsync();
        }
    }
}
