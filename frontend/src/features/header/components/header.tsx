import { useSuspenseQuery } from "@tanstack/react-query";
import { useCurrentBoardId } from "#frontend/store/board";
import { Button } from "#frontend/components/primitives/button";
import { getApiBoardsOptions } from "#frontend/types/generated/@tanstack/react-query.gen";
import {
  ChevronDown,
  ChevronUp,
  LogoMobile,
} from "#frontend/components/ui/icon";
import styles from "./header.module.css";
import { useToggle } from "#frontend/hooks/use-toggle";
import { useMediaQuery } from "#frontend/hooks/use-media-query";
import { CreateTaskDialog } from "#frontend/components/ui/create-task-dialog";
import { EditBoardPopover } from "#frontend/components/ui/edit-board-popover";

export function Header() {
  const { isOpen: isLeftDialogOpen, toggle: toggleLeftDialog } = useToggle();
  const { isMatch: isMobile } = useMediaQuery("(width < 768px)");
  const { data } = useSuspenseQuery(getApiBoardsOptions());
  const currentBoardId = useCurrentBoardId();

  const currentElement = data.find(({ id }) => id === currentBoardId);

  return (
    <>
      <header className={styles.layout}>
        <LogoMobile className={styles.logo} />
        <h1 className={styles.name}>{currentElement?.name ?? "No Board"}</h1>
        {isMobile ? (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={toggleLeftDialog}
          >
            {isLeftDialogOpen ? <ChevronUp /> : <ChevronDown />}
          </Button>
        ) : null}
        <CreateTaskDialog isMobile={isMobile} />
        <EditBoardPopover />
      </header>
    </>
  );
}
