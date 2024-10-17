import { invoke } from "@tauri-apps/api/core";
import type { Address } from "viem";

import { Button } from "@ethui/ui/components/shadcn/button";
import { EyeOff } from "lucide-react";
import { IconAddress } from "#/components/Icons/Address";
import { useBlacklist } from "#/store/useBlacklist";
import { useNetworks } from "#/store/useNetworks";
import { AddressView } from "../AddressView";

export function SettingsTokens() {
  const currentNetwork = useNetworks((s) => s.current);
  const blacklist = useBlacklist((s) => s.erc20Blacklist);

  if (!currentNetwork) return null;

  const unhide = (contract: Address) => {
    invoke("db_clear_erc20_blacklist", {
      chainId: currentNetwork.chain_id,
      address: contract,
    });
  };

  return (
    <ul className="w-full">
      {blacklist.map(({ contract, metadata }) => (
        <li className="flex gap-5 w-full items-center justify-between">
          <IconAddress chainId={currentNetwork.chain_id} address={contract} />

          <span className="flex gap-1 items-center">
            {metadata?.symbol}
            {contract && <AddressView address={contract} />}
          </span>

          <Button
            size="icon"
            title={"Unhide token"}
            onClick={() => unhide(contract)}
          >
            <EyeOff />
          </Button>
        </li>
      ))}
    </ul>
  );
}
