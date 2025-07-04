import { useSuspenseQuery } from "@tanstack/react-query";
import { useCurrentBoardId } from "#frontend/store/board";
import { Button } from "#frontend/components/button/button";
import { getApiBoardsOptions } from "#frontend/types/@tanstack/react-query.gen";
import {
  ChevronDown,
  ChevronUp,
  LogoMobile,
  VerticalEllipsis,
} from "#frontend/components/icon/icon";
import styles from "./header.module.css";
import { useToggle } from "#frontend/hooks/use-toggle";
import { EditOptionDialog } from "#frontend/components/dialog/edit-board";
import { useMediaQuery } from "#frontend/hooks/use-media-query";

export function Header() {
  const { isOpen: isLeftDialogOpen, toggle: toggleLeftDialog } = useToggle();
  const { isMatch: isMobile } = useMediaQuery("(max-width: 768px)");
  const {
    isOpen: isEditDialogOpen,
    open: openEditDialog,
    close: closeEditDialog,
  } = useToggle();
  const { data } = useSuspenseQuery(getApiBoardsOptions());
  const currentBoardId = useCurrentBoardId();

  const currentElement = data.find(({ id }) => id === currentBoardId);

  return (
    <>
      <header className={styles.layout}>
        <LogoMobile className={styles.logo} />
        <h1 className={styles.name}>{currentElement?.name ?? "No Board"}</h1>
        {isMobile ? (
          <button
            className={styles.chevron}
            type="button"
            onClick={toggleLeftDialog}
          >
            {isLeftDialogOpen ? <ChevronUp /> : <ChevronDown />}
          </button>
        ) : null}
        <Button className="add-task" type="button">
          {isMobile ? "+" : "+ Add New Task"}
        </Button>
        <button className={styles.edit} type="button" onClick={openEditDialog}>
          <VerticalEllipsis />
        </button>
        {isEditDialogOpen ? (
          <EditOptionDialog closeDialog={closeEditDialog} />
        ) : null}
      </header>
    </>
  );
}
