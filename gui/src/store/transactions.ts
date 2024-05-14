import { invoke, event } from "@tauri-apps/api";
import { create, StateCreator } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Address } from "viem";

import { Paginated, PaginatedTx } from "@ethui/types";

interface State {
  address?: string;
  chainId?: number;
  txs: Paginated<PaginatedTx>[];
  finished: boolean;
}

interface Setters {
  setWallet: (address: Address) => void;
  setChainId: (chainId: number) => void;
  reset: () => void;
}

type Store = State & Setters;

const store: StateCreator<Store> = (set, get) => ({
  txs: [],
  finished: false,

  setWallet(address) {
    set({ address });
    get().reset();
  },

  setChainId(chainId) {
    set({ chainId });
    get().reset();
  },

  reset() {
    set({ txs: [] });
  },
});

export const useTransactions = create<Store>()(subscribeWithSelector(store));

event.listen("txs-updated", () => {
  useTransactions.getState().reset();
});
