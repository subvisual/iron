import PortStream from "extension-port-stream";
import { createRoot } from "react-dom/client";
import browser from "webextension-polyfill";

import * as Constants from "@iron/constants";
import { Expanded } from "@iron/ui/roots";

function init() {
  const stream = initBackgroundStream();

  const appContainer = document.querySelector("#app-container");
  if (!appContainer) {
    throw new Error("Can not find #app-container");
  }
  const root = createRoot(appContainer);
  root.render(<Expanded stream={stream} />);
}

function initBackgroundStream() {
  const port = browser.runtime.connect({ name: Constants.windows.expanded });
  return new PortStream(port);
}

init();
