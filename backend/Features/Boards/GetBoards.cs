using backend.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Boards;

public record GetBoardsResponse
{
    public required int Id { get; init; }
    public required string Name { get; init; }
    public ICollection<GetBoardColumnsResponse> BoardColumns { get; init; } =
        [];
}

public record GetBoardColumnsResponse
{
    public required int Id { get; init; }
    public required string Name { get; init; }
}

public static class GetBoardsEndpoint
{
    public static async Task<Ok<List<GetBoardsResponse>>> GetAll(
        [FromServices] GetBoardsHandler handler
    )
    {
        var boards = await handler.Handle();

        return TypedResults.Ok(boards);
    }
}

public class GetBoardsHandler(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task<List<GetBoardsResponse>> Handle()
    {
        var boards = await _context
            .Boards.Select(b => new GetBoardsResponse
            {
                Id = b.Id,
                Name = b.Name,
                BoardColumns = b
                    .BoardColumns.Select(bc => new GetBoardColumnsResponse
                    {
                        Id = bc.Id,
                        Name = bc.Name,
                    })
                    .ToList(),
            })
            .ToListAsync();

        return boards;
    }
}
