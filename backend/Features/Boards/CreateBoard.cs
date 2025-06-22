using System.Data;
using backend.Models;
using backend.Shared;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static backend.Shared.GlobalConstants;

namespace backend.Features.Boards;

public record CreateBoardRequest
{
    public required string Name { get; init; }
    public ICollection<CreateBoardColumnRequest> BoardColumns { get; init; } =
        [];
}

public record CreateBoardColumnRequest
{
    public required string Name { get; init; }
}

public class CreateBoardRequestValidator : AbstractValidator<CreateBoardRequest>
{
    public CreateBoardRequestValidator()
    {
        RuleFor(b => b.Name).NotEmpty().MaximumLength(TITLE_MAX_LENGTH);
        RuleForEach(b => b.BoardColumns)
            .SetValidator(new CreateBoardColumnRequestValidator());
    }
}

public class CreateBoardColumnRequestValidator
    : AbstractValidator<CreateBoardColumnRequest>
{
    public CreateBoardColumnRequestValidator()
    {
        RuleFor(c => c.Name).NotEmpty().MaximumLength(TITLE_MAX_LENGTH);
    }
}

public static class CreateBoardEndpoint
{
    public static async Task<
        Results<ValidationProblem, Created, ProblemHttpResult>
    > Create(
        HttpContext httpContext,
        [FromServices] CreateBoardHandler handler,
        [FromServices] IValidator<CreateBoardRequest> validator,
        [FromBody] CreateBoardRequest command
    )
    {
        Console.WriteLine(httpContext);

        var validationResult = await validator.ValidateAsync(command);

        if (!validationResult.IsValid)
        {
            return TypedResults.ValidationProblem(
                validationResult.ToDictionary()
            );
        }

        try
        {
            await handler.Handle(command);
        }
        catch (DuplicateNameException ex)
        {
            return TypedResultsProblemDetails.Conflict(
                httpContext: httpContext,
                detail: ex.Message,
                type: ex.GetType().Name
            );
        }

        return TypedResults.Created();
    }
}

public class CreateBoardHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task Handle(CreateBoardRequest command)
    {
        var nameInDb = await _context
            .Boards.Where(b => b.Name == command.Name)
            .FirstOrDefaultAsync();

        if (nameInDb is not null)
        {
            throw new DuplicateNameException(
                $"Board name \"{command.Name}\" is already in database"
            );
        }

        var board = new Board
        {
            Name = command.Name,
            BoardColumns =
            [
                .. command.BoardColumns.Select(b => new BoardColumn
                {
                    Name = b.Name,
                }),
            ],
        };

        _context.Boards.Add(board);
        await _context.SaveChangesAsync();
    }
}
