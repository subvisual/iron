import * as tauri from "@tauri-apps/api";
import { useEffect } from "react";

type Event =
  | "peers-updated"
  | "settings-changed"
  | "contracts-updated"
  | "txs-updated";

export function useEventListener(event: Event, callback: () => unknown) {
  useEffect(() => {
    const unlisten = tauri.event.listen(event, () => {
      callback();
    });

    return () => {
      unlisten.then((cb) => cb());
    };
  }, [event, callback]);
}
