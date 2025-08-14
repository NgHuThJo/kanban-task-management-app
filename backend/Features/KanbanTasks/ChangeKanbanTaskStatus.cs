using System.ComponentModel.DataAnnotations;
using System.Security.AccessControl;
using backend.Models;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.KanbanTasks;

public record ChangeKanbanTaskStatusRequest
{
    [Range(1, int.MaxValue)]
    public required int Id { get; init; }

    [Range(1, int.MaxValue)]
    public required int BoardColumnId { get; init; }
}

public class ChangeKanbanTaskStatusValidator
    : AbstractValidator<ChangeKanbanTaskStatusRequest>
{
    public ChangeKanbanTaskStatusValidator()
    {
        RuleFor(c => c.Id).GreaterThan(0);
        RuleFor(c => c.BoardColumnId).GreaterThan(0);
    }
}

public static class ChangeKanbanTaskStatusEndpoint
{
    public static async Task<
        Results<ValidationProblem, NoContent>
    > ChangeStatus(
        [FromServices] ChangeKanbanTaskStatusHandler handler,
        [FromServices] IValidator<ChangeKanbanTaskStatusRequest> validator,
        [FromBody] ChangeKanbanTaskStatusRequest command
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

public class ChangeKanbanTaskStatusHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task Handle(ChangeKanbanTaskStatusRequest command)
    {
        var kanbanTask =
            await _context.KanbanTasks.FindAsync(command.Id)
            ?? throw new Exception("Kanban task not found");

        kanbanTask.BoardColumnId = command.BoardColumnId;

        await _context.SaveChangesAsync();

        return;
    }
}
