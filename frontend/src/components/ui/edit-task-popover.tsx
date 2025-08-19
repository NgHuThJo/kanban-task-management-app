import { Button } from "#frontend/components/primitives/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "#frontend/components/primitives/popover";
import { UpdateKanbantaskDialog } from "#frontend/components/ui/update-task-dialog";
import { VerticalEllipsis } from "#frontend/components/ui/icon";
import type { GetKanbanTasksResponse } from "#frontend/types/generated";
import { DeleteBoardDialog } from "#frontend/components/ui/delete-board-dialog";
import { DeleteKanbantaskDialog } from "#frontend/components/ui/delete-task-dialog";

type EditKanbantaskPopoverProps = {
  task: GetKanbanTasksResponse;
};

export function EditKanbanTaskPopover({ task }: EditKanbantaskPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <VerticalEllipsis />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={16}>
        <UpdateKanbantaskDialog task={task} />
        <DeleteKanbantaskDialog task={task} />
      </PopoverContent>
    </Popover>
  );
}
