using backend.Features;
using backend.Models;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
var assembly = typeof(Program).Assembly;
var handlerTypes = assembly
    .GetTypes()
    .Where(t => t.IsClass && !t.IsAbstract && t.Name.EndsWith("Handler"));

foreach (var handlerType in handlerTypes)
{
    builder.Services.AddScoped(handlerType);
}

builder.Services.AddValidatorsFromAssembly(assembly);
builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("PostgresConnection")
    )
);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.MapBoardApi().MapKanbanTaskApi();

app.Run();
