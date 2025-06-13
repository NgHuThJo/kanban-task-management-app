using backend.Models;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static backend.Shared.Globals;

namespace backend.Features.KanbanTasks;

public record CreateKanbanTaskRequest
{
    public required string Title { get; init; }

    public required string Description { get; init; }

    public int BoardColumnId { get; init; }
    public ICollection<CreateSubtaskRequest> Subtasks { get; init; } = [];
}

public record CreateSubtaskRequest
{
    public required string Description { get; init; }
}

public class CreateKanbanTaskRequestValidator
    : AbstractValidator<CreateKanbanTaskRequest>
{
    public CreateKanbanTaskRequestValidator()
    {
        RuleFor(t => t.Title).NotEmpty().MaximumLength(TITLE_MAX_LENGTH);
        RuleFor(t => t.Description).NotEmpty();
        RuleFor(t => t.BoardColumnId).GreaterThan(0);
        RuleForEach(b => b.Subtasks)
            .SetValidator(new CreateSubtaskRequestValidator());
    }
}

public class CreateSubtaskRequestValidator
    : AbstractValidator<CreateSubtaskRequest>
{
    public CreateSubtaskRequestValidator()
    {
        RuleFor(s => s.Description).NotEmpty().MaximumLength(TITLE_MAX_LENGTH);
    }
}

public static class CreateKanbanTasksEndpoint
{
    public static async Task<Results<ValidationProblem, Created>> Create(
        [FromServices] CreateKanbanTaskHandler handler,
        [FromServices] IValidator<CreateKanbanTaskRequest> validator,
        [FromBody] CreateKanbanTaskRequest command
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

        return TypedResults.Created();
    }
}

public class CreateKanbanTaskHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task Handle(CreateKanbanTaskRequest command)
    {
        var boardColumn =
            await _context.BoardColumns.FirstOrDefaultAsync(b =>
                b.Id == command.BoardColumnId
            ) ?? throw new Exception("Board column not found");

        var kanbanTask = new KanbanTask
        {
            Title = command.Title,
            Description = command.Description,
            BoardColumn = boardColumn,
            Subtasks =
            [
                .. command.Subtasks.Select(s => new Subtask
                {
                    Description = s.Description,
                }),
            ],
        };

        _context.KanbanTasks.Add(kanbanTask);
        await _context.SaveChangesAsync();
    }
}
