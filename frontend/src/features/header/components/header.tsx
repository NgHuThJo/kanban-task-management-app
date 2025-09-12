import { useSuspenseQuery } from "@tanstack/react-query";
import styles from "./header.module.css";
import { CreateKanbanTaskDialog } from "#frontend/components/ui/create-task-dialog";
import { EditBoardPopover } from "#frontend/components/ui/edit-board-popover";
import { Logo, LogoMobile } from "#frontend/components/ui/icon";
import { SidebarDialog } from "#frontend/components/ui/sidebar-dialog";
import { useMediaQuery } from "#frontend/hooks/use-media-query";
import { useCurrentBoardId } from "#frontend/store/board";
import { getApiBoardsOptions } from "#frontend/types/generated/@tanstack/react-query.gen";

export function Header() {
  const { isMatch: isMobile } = useMediaQuery("(width < 768px)");
  const { data } = useSuspenseQuery(getApiBoardsOptions());
  const currentBoardId = useCurrentBoardId();

  const currentElement = data.find(({ id }) => id === currentBoardId);

  return (
    <>
      <header className={styles.layout}>
        <div className={styles["header-left"]}>
          {isMobile ? (
            <LogoMobile className={styles.logo} />
          ) : (
            <Logo className={styles["desktop-logo"]} />
          )}
        </div>
        <div className={styles["header-right"]}>
          <h1 className={styles.name}>{currentElement?.name ?? "No Board"}</h1>
          {isMobile ? <SidebarDialog /> : null}
          <CreateKanbanTaskDialog isMobile={isMobile} />
          {currentElement ? <EditBoardPopover /> : null}
        </div>
      </header>
    </>
  );
}
