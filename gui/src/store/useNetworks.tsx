import { event } from "@tauri-apps/api";
import { invoke } from "@tauri-apps/api/core";
import { type StateCreator, create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import type { Network } from "@ethui/types/network";
import { ChainIcon } from "@ethui/ui/components/icons/chain";
import type { Action } from "#/components/CommandBar";

interface State {
  networks: Network[];
  current?: Network;
  actions: Action[];
}

interface Setters {
  setNetworks: (newNetworks: Network[]) => Promise<void>;
  setCurrent: (newNetwork: string) => Promise<void>;
  resetNetworks: () => Promise<void>;
  reload: () => Promise<void>;
  reloadActions: () => void;
  isAlchemySupportedNetwork: () => Promise<boolean>;
}

type Store = State & Setters;

const actionId = "networks";

const store: StateCreator<Store> = (set, get) => ({
  networks: [],
  actions: [],

  async setNetworks(newNetworks) {
    const networks = await invoke<Network[]>("networks_set_list", {
      newNetworks,
    });
    set({ networks });
  },

  async setCurrent(network) {
    const current = await invoke<Network>("networks_set_current", { network });

    set({ current });
  },

  async resetNetworks() {
    const networks = await invoke<Network[]>("networks_reset");
    set({ networks });
  },

  async reload() {
    const current = await invoke<Network>("networks_get_current");
    const networks = await invoke<Network[]>("networks_get_list");
    set({ networks, current });
    get().reloadActions();
  },

  reloadActions() {
    const networks = get().networks;

    const actions = (networks || []).map((network) => ({
      id: `${actionId}/${network.name}`,
      text: `${network.name}`,
      icon: <ChainIcon chainId={network.dedup_chain_id.chain_id} />,
      run: () => {
        get().setCurrent(network.name);
      },
    }));

    set({ actions });
  },

  async isAlchemySupportedNetwork() {
    const current = get().current;

    if (!current) return false;

    return await invoke<boolean>("sync_alchemy_is_network_supported", {
      chainId: current.dedup_chain_id.chain_id,
    });
  },
});

export const useNetworks = create<Store>()(subscribeWithSelector(store));

event.listen("networks-changed", async () => {
  await useNetworks.getState().reload();
});

event.listen("current-network-changed", async () => {
  await useNetworks.getState().reload();
});

(async () => {
  await useNetworks.getState().reload();
})();
