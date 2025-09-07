using System.ComponentModel.DataAnnotations;
using backend.Models;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.KanbanTasks;

public record ChangeBoardColumnRequest
{
    [Range(1, int.MaxValue)]
    public required int Id { get; init; }

    [Range(1, int.MaxValue)]
    public required int BoardColumnId { get; init; }
}

public class ChangeBoardColumnValidator
    : AbstractValidator<ChangeBoardColumnRequest>
{
    public ChangeBoardColumnValidator()
    {
        RuleFor(k => k.Id).GreaterThan(0);
        RuleFor(k => k.BoardColumnId).GreaterThan(0);
    }
}

public static class ChangeBoardColumnEndpoint
{
    public static async Task<
        Results<ValidationProblem, NoContent>
    > ChangeBoardColumn(
        [FromServices] ChangeBoardColumnHandler handler,
        [FromServices] IValidator<ChangeBoardColumnRequest> validator,
        [FromBody] ChangeBoardColumnRequest command
    )
    {
        var validationResult = await validator.ValidateAsync(command);

        if (!validationResult.IsValid)
        {
            return TypedResults.ValidationProblem(
                validationResult.ToDictionary()
            );
        }

        await handler.Handle(command);

        return TypedResults.NoContent();
    }
}

public class ChangeBoardColumnHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task Handle(ChangeBoardColumnRequest command)
    {
        var kanbantask =
            await _context.KanbanTasks.FindAsync(command.Id)
            ?? throw new Exception(
                $"Kanban task with id {command.Id} does not exist"
            );

        kanbantask.BoardColumnId = command.BoardColumnId;

        await _context.SaveChangesAsync();
    }
}
