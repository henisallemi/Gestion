using System;
namespace AngularAuthAPI.Models
{

public class Book
{
    public double Id { get; set; }
    public string Title { get; set; }
    public string Author { get; set; }
    public double ISBN { get; set; }
    public string Genre { get; set; }
    public DateTime DatePublication { get; set; }
    public string Editeur { get; set; }
    public string Langue { get; set; }
    public string Description { get; set; }
    public double Nb_Page { get; set; }
}
}
