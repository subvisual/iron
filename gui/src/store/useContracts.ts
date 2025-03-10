import { event } from "@tauri-apps/api";
import { invoke } from "@tauri-apps/api/core";
import type { Address } from "viem";
import { type StateCreator, create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import type { Contract } from "@ethui/types";
import { toast } from "@ethui/ui/hooks/use-toast";
import { useNetworks } from "./useNetworks";

interface State {
  chainId?: number;
  contracts: Contract[];
}

interface Setters {
  reload: () => Promise<void>;
  add: (chainId: number, address: Address) => Promise<void>;
  setChainId: (chainId?: number) => void;
  filteredContracts: (filter: string) => Contract[];
}

type Store = State & Setters;

const store: StateCreator<Store> = (set, get) => ({
  contracts: [],

  async reload() {
    const { chainId } = get();
    if (!chainId) return;

    const contracts = await invoke<Contract[]>("db_get_contracts", {
      chainId,
    });
    const contractsWithAlias = await Promise.all(
      contracts.map(async (c) => {
        const alias = await invoke<string | undefined>("settings_get_alias", {
          address: c.address,
        });
        return { ...c, alias };
      }),
    );

    const filteredContractsAndProxiesWithAlias = contractsWithAlias.reduce(
      (acc: Contract[], c: Contract) => {
        if (c.proxiedBy) {
          const proxyName = contractsWithAlias.find(
            (e) => e.proxyFor === c.address,
          )?.name;
          acc.push({ ...c, proxyName });
        } else if (!c.proxyFor) {
          acc.push(c);
        }
        return acc;
      },
      [],
    );

    set({ contracts: filteredContractsAndProxiesWithAlias });
  },

  add: async (chainId: number, address: Address) => {
    try {
      await invoke("add_contract", {
        chainId: Number(chainId),
        address,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.toString(),
        variant: "destructive",
      });
    }
  },

  filteredContracts(filter: string) {
    const lowerCaseFilter = filter.toLowerCase();
    const { contracts } = get();

    if (lowerCaseFilter === "") return contracts;
    return contracts.filter((contract) =>
      `${contract.address} ${contract.name} ${contract.alias}`
        .toLowerCase()
        .includes(lowerCaseFilter),
    );
  },

  setChainId(chainId) {
    set({ chainId });
    get().reload();
  },
});

export const useContracts = create<Store>()(subscribeWithSelector(store));

event.listen("contracts-updated", async () => {
  await useContracts.getState().reload();
});

useNetworks.subscribe(
  (s) => s.current?.dedup_chain_id.chain_id,
  (chainId) => useContracts.getState().setChainId(chainId),
  { fireImmediately: true },
);
