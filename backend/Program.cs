using backend.Features;
using backend.Models;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using NSwag;
using NSwag.CodeGeneration.TypeScript;
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
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("PostgresConnection")
    )
);
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "DevCorsPolicy",
        policy =>
        {
            policy.AllowAnyHeader().AllowAnyOrigin().AllowAnyMethod();
        }
    );
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseOpenApi(options =>
    {
        options.Path = "/openapi/v1.json";
    });
    app.UseCors("DevCorsPolicy");
    app.MapScalarApiReference();

    app.MapGet(
        "/generate-client",
        async () =>
        {
            var document = await OpenApiDocument.FromUrlAsync(
                "http://localhost:5096/openapi/v1.json"
            );

            var settings = new TypeScriptClientGeneratorSettings
            {
                ClassName = "ApiClient",
                Template = TypeScriptTemplate.Fetch,
            };

            var generator = new TypeScriptClientGenerator(document, settings);
            var code = generator.GenerateFile();

            await File.WriteAllTextAsync(
                "../frontend/src/client/generated-client.ts",
                code
            );

            return Results.Ok("Client generated successfully");
        }
    );
}
else
{
    app.UseHttpsRedirection();
}

app.MapBoardApi().MapKanbanTaskApi();

app.Run();
