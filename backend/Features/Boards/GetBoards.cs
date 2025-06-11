using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Boards;

public record GetBoardsDto
{
    public required int Id { get; init; }
    public required string Name { get; init; }
    public ICollection<GetBoardColumnsDto> BoardColumns { get; init; } = [];
}

public record GetBoardColumnsDto
{
    public required int Id { get; init; }
    public required string Name { get; init; }
}

public static class GetBoardsEndpoint
{
    public static async Task<IResult> GetAll(
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

    public async Task<List<GetBoardsDto>> Handle()
    {
        var boards = await _context
            .Boards.Select(b => new GetBoardsDto
            {
                Id = b.Id,
                Name = b.Name,
                BoardColumns = b
                    .BoardColumns.Select(bc => new GetBoardColumnsDto
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
