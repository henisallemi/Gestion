using AngularAuthAPI.Context;
using AngularAuthAPI.Repository;
using Aspose.Cells.Charts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(option => {        

    option.AddPolicy("MyPolicy", builder => {
        builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();

    });
}); 

builder.Services.AddDbContext<AppDbContext>(option =>
{
    option.UseSqlServer(builder.Configuration.GetConnectionString("SqlServerConnStr")).UseLazyLoadingProxies();
}
);

builder.Services.AddScoped<IUserRepo, UserRepo>();
builder.Services.AddScoped<IBookRepo, BookRepo>(); 

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("MyPolicy");
app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();

app.Run();
