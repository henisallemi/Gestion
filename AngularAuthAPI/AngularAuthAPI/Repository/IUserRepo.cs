using AngularAuthAPI.Models;
using System.Threading.Tasks;

namespace AngularAuthAPI.Repository
{
    public interface IUserRepo
    {
        Task<User> AuthenticateAsync(User user);
        Task<bool> CheckUserNameExistAsync(string username);
        Task<bool> CheckEmailExistAsync(string email);
        Task RegisterUserAsync(User user);
    }
}
                