using backend.Models;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.KanbanTasks;

public record GetKanbanTasksRequest
{
    public int BoardColumnId { get; set; }
}

public record GetKanbanTasksResponse
{
    public required int Id { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
}

public record GetSubtasksResponse
{
    public required string Description { get; init; }
    public required bool IsCompleted { get; init; }
}

public class GetKanbanTasksRequestValidator
    : AbstractValidator<GetKanbanTasksRequest>
{
    public GetKanbanTasksRequestValidator()
    {
        RuleFor(task => task.BoardColumnId).GreaterThan(1);
    }
}

public static class GetKanbanTasksEndpoint
{
    public static async Task<
        Results<ValidationProblem, Ok<List<GetKanbanTasksResponse>>>
    > GetAll(
        [FromServices] GetKanbanTasksHandler handler,
        [FromServices] IValidator<GetKanbanTasksRequest> validator,
        [FromBody] GetKanbanTasksRequest query
    )
    {
        var validationResult = await validator.ValidateAsync(query);

        if (!validationResult.IsValid)
        {
            return TypedResults.ValidationProblem(
                validationResult.ToDictionary()
            );
        }

        var kanbanTasks = await handler.Handle(query);

        return TypedResults.Ok(kanbanTasks);
    }
}

public class GetKanbanTasksHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task<List<GetKanbanTasksResponse>> Handle(
        GetKanbanTasksRequest query
    )
    {
        var kanbanTasks = await _context
            .KanbanTasks.Where(t => t.BoardColumnId == query.BoardColumnId)
            .Select(t => new GetKanbanTasksResponse
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
            })
            .ToListAsync();

        return kanbanTasks;
    }
}
