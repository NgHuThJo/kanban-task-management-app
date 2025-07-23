import { Button } from "#frontend/components/primitives/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "#frontend/components/primitives/popover";
import { DeleteBoardDialog } from "#frontend/components/ui/delete-board-dialog";
import { VerticalEllipsis } from "#frontend/components/ui/icon";
import { UpdateBoardDialog } from "#frontend/components/ui/update-board-dialog";

export function EditBoardPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <VerticalEllipsis />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={16}>
        <UpdateBoardDialog />
        <DeleteBoardDialog />
      </PopoverContent>
    </Popover>
  );
}
