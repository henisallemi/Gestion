using Microsoft.EntityFrameworkCore;
using AngularAuthAPI.Models;
using System.ComponentModel.DataAnnotations.Schema;

public class Book
{
    public int Id { get; set; }
    public string Title { get; set; }
    //public string Author { get; set; }
    public string ISBN { get; set; }
    public string Genre { get; set; }
    public string DatePublication { get; set; }  
    public string Editeur { get; set;} 
    public string Langue { get; set; }
    public string Description { get; set; }
    public int Nb_Page { get; set; }
    public float Prix { get; set; }
    public int Id_Auth { get; set; }

    [ForeignKey("Id_Auth")]
    public virtual Author Auth { get; set; }
}           