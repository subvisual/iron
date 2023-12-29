import { invoke, event } from "@tauri-apps/api";
import { Action } from "kbar";
import { create, StateCreator } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { GeneralSettings } from "@iron/types/settings";

interface Store {
  settings?: GeneralSettings;
  actions: Action[];

  reload: () => void;
}

const actionId = "settings/fastMode";

const store: StateCreator<Store> = (set) => ({
  settings: undefined,
  actions: [
    {
      id: actionId,
      name: "Fast mode",
      subtitle: "enable/disable",
      shortcut: ["˄ ", "+", " F"],
    },
    ...(["Enable", "Disable"] as const).map((mode, index) => ({
      id: `${actionId}/${mode}`,
      name: `${index + 1}: ${mode}`,
      parent: actionId,
      perform: () => {
        const currentMode = mode === "Disable" ? false : true;
        invoke("settings_set_fast_mode", { mode: currentMode });
      },
    })),
  ],

  async reload() {
    const settings = await invoke<GeneralSettings>("settings_get");

    set({ settings });
  },
});

export const useSettings = create<Store>()(subscribeWithSelector(store));

event.listen("settings-changed", () => {
  useSettings.getState().reload();
});

useSettings.getState().reload();
