import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";

export function useEventListen(event: string, callback: () => unknown) {
  useEffect(() => {
    const unlisten = listen(event, () => {
      callback();
    });

    return () => {
      unlisten.then((cb) => cb());
    };
  }, [event, callback]);
}
