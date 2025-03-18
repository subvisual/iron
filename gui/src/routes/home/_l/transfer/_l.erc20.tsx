import { addressSchema } from "@ethui/types/wallets";
import { Form } from "@ethui/ui/components/form";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@ethui/ui/components/shadcn/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { type FieldValues, useForm } from "react-hook-form";
import {
  type Address,
  encodeFunctionData,
  ethAddress,
  formatUnits,
  parseAbiItem,
} from "viem";
import { z } from "zod";
import { useShallow } from "zustand/shallow";
import { useBalances } from "#/store/useBalances";
import { useNetworks } from "#/store/useNetworks";
import { useWallets } from "#/store/useWallets";

import { zodValidator } from "@tanstack/zod-adapter";
import { Terminal } from "lucide-react";
import type { Token } from "./-common";

interface Params {
  chainId: string;
  contract: string;
}

const searchSchema = z.object({
  contract: z.string().optional(),
});

export const Route = createFileRoute("/home/_l/transfer/_l/erc20")({
  beforeLoad: () => ({ breadcrumb: "ERC20" }),
  validateSearch: zodValidator(searchSchema),
  loader: ({ params }: { params: Params }) => ({
    chainId: Number(params.chainId),
    contract: params.contract,
  }),

  component: RouteComponent,
});

function RouteComponent() {
  const { contract } = Route.useSearch();
  const navigate = useNavigate();

  const network = useNetworks((s) => s.current);
  const address = useWallets((s) => s.address);
  const { native, erc20s } = useBalances(
    useShallow((s) => {
      return { native: s.nativeBalance, erc20s: s.erc20Balances };
    }),
  );
  const [result, setResult] = useState<string | null>(null);
  const [decimals, setDecimals] = useState<number>();

  // map list of tokens
  const [tokens, setTokens] = useState<Token[]>([]);
  useEffect(() => {
    if (!network || !native) return;

    const newTokens = erc20s.map(({ metadata, balance, contract }) => ({
      currency: metadata?.symbol,
      decimals: metadata?.decimals,
      balance: BigInt(balance),
      contract: contract,
    }));
    const nativeToken = {
      currency: network.currency,
      decimals: network.decimals,
      balance: native,
      contract: ethAddress,
    };
    setTokens([nativeToken, ...newTokens]);
  }, [native, erc20s, network]);

  //const decimals = currentToken?.decimals ?? 18;
  const schema = z.object({
    to: addressSchema.optional(),
    currency: addressSchema,
    value: z.string().transform((val, ctx) => {
      const num = Number.parseFloat(val);
      if (Number.isNaN(num)) {
        ctx.addIssue({
          message: "Invalid value",
          code: z.ZodIssueCode.custom,
        });
        return z.NEVER;
      }
      return BigInt(num * 10 ** (decimals || 0));
    }),
  });

  type Schema = z.infer<typeof schema>;

  const form = useForm<Schema>({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: {
      currency: contract,
      value: 0n,
    },
  });

  const currency = form.watch("currency");
  const currentToken = tokens.find((t) => t.contract === currency);

  useEffect(() => {
    setDecimals(currentToken?.decimals);
  }, [currentToken]);

  // redirect if ETH is detected
  useEffect(() => {
    if (currentToken?.contract === ethAddress) {
      navigate({ to: "/home/transfer/eth" });
    }
  }, [currentToken, navigate]);

  if (!network || !address || !currentToken) return null;

  const onSubmit = async (data: FieldValues) => {
    const hash = await transferERC20(
      address,
      data.to,
      data.value,
      currentToken.contract,
    );
    setResult(hash);
  };

  return (
    <Form form={form} onSubmit={onSubmit} className="p-2">
      <Form.Select
        name="currency"
        label="Token"
        items={tokens}
        toValue={(v) => v.contract}
        render={(v) => v.currency}
      />
      <span>
        Balance: {formatUnits(currentToken.balance, currentToken.decimals)}
      </span>
      <Form.Text label="To" name="to" className="w-full" />
      <Form.Text label="Amount" name="value" className="w-full" />

      {form.formState.isSubmitted && result && (
        <Alert className="w-full">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Transaction sent!</AlertTitle>
          <AlertDescription className="max-w-full overflow-hidden break-all">
            {result}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Form.Submit label="Send" />
      </div>
    </Form>
  );
}

const transferERC20 = async (
  from: Address,
  to: Address,
  value: bigint,
  contract: Address,
) => {
  const data = encodeFunctionData({
    abi: [
      parseAbiItem("function transfer(address to, uint amount) returns (bool)"),
    ],
    args: [to, value],
  });

  return await invoke<`0x${string}`>("rpc_send_transaction", {
    params: {
      from,
      to: contract,
      data,
    },
  });
};
