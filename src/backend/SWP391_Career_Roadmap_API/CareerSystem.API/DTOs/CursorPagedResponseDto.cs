using System.Collections.Generic;

namespace CareerSystem.API.DTOs
{
    public class CursorPagedResponseDto<T>
    {
        public List<T> Items { get; set; } = new();
        public string? NextCursor { get; set; }
        public bool HasNextPage { get; set; }
        public int TotalCount { get; set; }
    }
}
