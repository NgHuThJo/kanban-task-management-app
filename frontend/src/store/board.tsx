import { createContext, use, useState, type PropsWithChildren } from "react";
import { type StoreApi, create, useStore } from "zustand";

type BoardStoreProviderProps = PropsWithChildren & {
  id: number;
};

type BoardStore = {
  currentBoardId: number;
  setCurrentBoardId: (id: number) => void;
};

const BoardContext = createContext<StoreApi<BoardStore> | null>(null);

export const useBoardStore = <T,>(selector: (state: BoardStore) => T) => {
  const store = use(BoardContext);

  if (!store) {
    throw new Error("Missing BoardProvider");
  }

  return useStore(store, selector);
};

export const useCurrentBoardId = () =>
  useBoardStore((state) => state.currentBoardId);

export function BoardStoreProvider({ children, id }: BoardStoreProviderProps) {
  const [store] = useState(() =>
    create<BoardStore>()((set) => ({
      currentBoardId: id,
      setCurrentBoardId: (id) =>
        set(() => ({
          currentBoardId: id,
        })),
    })),
  );

  return <BoardContext value={store}>{children}</BoardContext>;
}
