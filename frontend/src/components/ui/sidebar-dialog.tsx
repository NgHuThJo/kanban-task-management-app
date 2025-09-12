import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, type CSSProperties } from "react";
import styles from "./sidebar-dialog.module.css";
import { Button } from "#frontend/components/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "#frontend/components/primitives/dialog";
import { CreateBoardDialog } from "#frontend/components/ui/create-board-dialog";
import {
  BoardIcon,
  ChevronDown,
  ChevronUp,
  VerticalEllipsis,
} from "#frontend/components/ui/icon";
import { ThemeSwitch } from "#frontend/features/sidebar/components/theme-switch";
import { useBoardStore, useCurrentBoardId } from "#frontend/store/board";
import { getApiBoardsOptions } from "#frontend/types/generated/@tanstack/react-query.gen";

export function SidebarDialog() {
  const [open, setOpen] = useState(false);
  const { data: boards } = useSuspenseQuery(getApiBoardsOptions());
  const currentBoardId = useCurrentBoardId();
  const setBoardId = useBoardStore((state) => state.setCurrentBoardId);

  const handleChangeBoard = (id: number) => {
    setBoardId(id);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          {open ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby="mobile sidebar dialog"
        showCloseButton={false}
        variant="sidebar"
        style={
          {
            "--padding-inline": "1.5rem",
          } as CSSProperties & Record<`--${string}`, string | number>
        }
      >
        <DialogTitle
          style={
            {
              "padding-inline": "var(--padding-inline)",
            } as CSSProperties & Record<`--${string}`, string | number>
          }
        >{`All Boards (${boards.length})`}</DialogTitle>
        <div className={styles["button-list"]}>
          {boards.map(({ id, name }) => (
            <Button
              variant="sidebar"
              size="sidebar"
              intent={id === currentBoardId ? "active" : undefined}
              onClick={() => {
                handleChangeBoard(id);
              }}
            >
              <VerticalEllipsis style={{ width: "1rem", height: "1rem" }} />
              {name}
            </Button>
          ))}
          <CreateBoardDialog
            trigger={
              <Button variant="sidebar" size="sidebar" intent="create">
                <BoardIcon style={{ width: "1rem" }} />
                +Create New Board
              </Button>
            }
          />
        </div>
        <div
          style={
            {
              paddingInline: "var(--padding-inline)",
            } as CSSProperties & Record<`--${string}`, string | number>
          }
        >
          <ThemeSwitch />
        </div>
      </DialogContent>
    </Dialog>
  );
}
