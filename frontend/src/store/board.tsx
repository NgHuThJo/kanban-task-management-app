import { createContext, use, useState, type PropsWithChildren } from "react";
import { create, useStore, type StoreApi } from "zustand";

type BoardStore = {
  currentBoardId: number | null;
  setBoardId: (id: number) => void;
};

const BoardContext = createContext<StoreApi<BoardStore> | null>(null);

export const useBoardStore = <T,>(selector: (state: BoardStore) => T) => {
  const store = use(BoardContext);

  if (store === null) {
    throw new Error("BoardStoreProvider is missing");
  }

  return useStore(store, selector);
};

export function BoardContextProvider({ children }: PropsWithChildren) {
  const [store] = useState(() =>
    create<BoardStore>()((set) => ({
      currentBoardId: null,
      setBoardId: (id) => {
        set(() => ({
          currentBoardId: id,
        }));
      },
    })),
  );

  return <BoardContext value={store}>{children}</BoardContext>;
}
