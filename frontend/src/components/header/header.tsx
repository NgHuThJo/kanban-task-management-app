import { Button } from "#frontend/components/button/button";
import { VerticalEllipsis } from "#frontend/components/icon/icon";

type HeaderProps = {
  currentBoardName: string;
};

export function Header({ currentBoardName }: HeaderProps) {
  return (
    <header>
      <h1>{currentBoardName}</h1>
      <Button className="add-task">+ Add New Task</Button>
      <Button>
        <VerticalEllipsis />
      </Button>
    </header>
  );
}
