import { zodResolver } from "@hookform/resolvers/zod";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { type FieldValues, useForm } from "react-hook-form";
import { type Address, formatUnits } from "viem";
import { z } from "zod";

import { passwordFormSchema, passwordSchema } from "@ethui/types/password";
import {
  type HdWallet,
  derivationPathSchema,
  mnemonicSchema,
} from "@ethui/types/wallets";
import { Form } from "@ethui/ui/components/form";
import { Button } from "@ethui/ui/components/shadcn/button";
import { useProvider } from "#/hooks/useProvider";
import { truncateHex } from "#/utils";

const schema = z.object({
  count: z.number().int().min(1).max(100),
  name: z.string().min(1),
  current: z.array(z.string()).length(2).optional(),
  mnemonic: mnemonicSchema,
  derivationPath: derivationPathSchema,
  password: passwordSchema,
});

const createSchema = schema.extend({
  current: z.string(),
});

const updateSchema = schema.pick({
  name: true,
  derivationPath: true,
  count: true,
});

type CreateSchema = z.infer<typeof createSchema>;
type UpdateSchema = z.infer<typeof updateSchema>;

interface Props {
  wallet?: HdWallet;

  onSubmit: (data: CreateSchema | UpdateSchema) => void;
  onRemove: () => void;
}

export function HDWalletForm({ wallet, ...props }: Props) {
  if (!wallet) {
    return <Create {...props} />;
  } else {
    return <Update wallet={wallet} {...props} />;
  }
}

function Create({ onSubmit, onRemove }: Props) {
  const [name, setName] = useState("");
  const [step, setStep] = useState(0);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [derivationPath, setDerivationPath] = useState<string | null>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (!current || !mnemonic || !derivationPath || submitted) return;
    onSubmit({
      count: 5,
      name,
      mnemonic,
      derivationPath,
      current,
      password,
    });
    setSubmitted(true);
  }, [name, current, mnemonic, derivationPath, password, onSubmit, submitted]);

  return (
    <div className="m-2 flex flex-col flex-col">
      {step === 0 && (
        <MnemonicStep
          onSubmit={(name: string, mnemonic) => {
            setName(name);
            setMnemonic(mnemonic);
            setStep(1);
          }}
          onCancel={onRemove}
        />
      )}

      {step === 1 && (
        <PasswordStep
          onSubmit={(p) => {
            setPassword(p);
            setStep(2);
          }}
          onCancel={onRemove}
        />
      )}

      {step === 2 && (
        <ReviewStep
          mnemonic={mnemonic}
          onSubmit={(derivationPath, current) => {
            setDerivationPath(derivationPath);
            setCurrent(current);
          }}
          onCancel={onRemove}
        />
      )}
    </div>
  );
}

interface MnemonicStepProps {
  onSubmit: (name: string, mnemonic: string) => void;
  onCancel: () => void;
}

function MnemonicStep({ onSubmit, onCancel }: MnemonicStepProps) {
  const schema = createSchema.pick({ name: true, mnemonic: true });
  const form = useForm({
    mode: "onChange",
    resolver: zodResolver(schema),
  });
  const onSubmitInternal = (data: FieldValues) => {
    onSubmit(data.name, data.mnemonic);
    form.reset(data);
  };

  return (
    <Form form={form} onSubmit={onSubmitInternal}>
      <Form.Text label="Name" name="name" className="w-full" />

      <span>Insert your 12-word mnemonic</span>
      <Form.Textarea
        label="12-word mnemonic"
        name="mnemonic"
        className="w-full"
      />

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <Form.Submit label="Continue" />
      </div>
    </Form>
  );
}

interface PasswordStepProps {
  onSubmit: (mnemonic: string) => void;
  onCancel: () => void;
}

function PasswordStep({ onSubmit, onCancel }: PasswordStepProps) {
  const form = useForm({
    mode: "onChange",
    resolver: zodResolver(passwordFormSchema),
  });

  return (
    <Form form={form} onSubmit={(d) => onSubmit(d.password)}>
      <span>Choose a secure password</span>
      <Form.Text type="password" label="Password" name="password" />
      <Form.Text
        type="password"
        label="Password Confirmation"
        name="passwordConfirmation"
      />

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <Form.Submit label="Continue" />
      </div>
    </Form>
  );
}

interface ReviewStepProps {
  mnemonic: string;
  onSubmit: (derivationPath: string, key: string) => void;
  onCancel: () => void;
}

function ReviewStep({ mnemonic, onSubmit, onCancel }: ReviewStepProps) {
  const schema = createSchema.pick({ derivationPath: true });
  const defaultValues = {
    derivationPath: derivationPathSchema.parse(undefined),
  };

  const form = useForm({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues,
  });

  const [addresses, setAddresses] = useState<[string, Address][]>([]);
  const [current, setCurrent] = useState<string | null>(null);

  const onSubmitInternal = (data: FieldValues) => {
    if (!current) return;
    onSubmit(data.derivationPath, current);
  };

  const derivationPath = form.watch("derivationPath");

  useEffect(() => {
    setCurrent(null);
    invoke<[string, Address][]>("wallets_get_mnemonic_addresses", {
      mnemonic,
      derivationPath,
    }).then(setAddresses);
  }, [mnemonic, derivationPath]);

  return (
    <Form form={form} onSubmit={onSubmitInternal}>
      <Form.Text label="Derivation Path" name="derivationPath" />

      {form.formState.isValid && (
        <div className="flex flex-col">
          <table>
            <tbody>
              {addresses.map(([key, address]) => (
                <tr key={key}>
                  <td>{truncateHex(address)}</td>
                  <td align="right">
                    <NativeBalance address={address} />
                  </td>
                  <td>
                    <Button
                      variant={current === key ? "secondary" : "outline"}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrent(key);
                      }}
                    >
                      Pick
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>

            <Form.Submit label="Save" />
          </div>
        </div>
      )}
    </Form>
  );
}

interface NativeBalanceProps {
  address: Address;
}

function NativeBalance({ address }: NativeBalanceProps) {
  const provider = useProvider();
  const symbol = provider?.chain?.nativeCurrency.symbol || "ETH";
  const decimals = provider?.chain?.nativeCurrency.decimals || 18;
  const [balance, setBalance] = useState<string>("");

  useEffect(() => {
    if (!provider) return;
    provider.getBalance({ address }).then((balance: bigint) => {
      if (balance === 0n) return;

      const threshold = BigInt(0.001 * 10 ** decimals);
      if (balance < threshold) {
        setBalance("< 0.001");
      } else {
        const truncatedBalance = balance - (balance % threshold);
        setBalance(formatUnits(truncatedBalance, decimals));
      }
    });
  }, [provider, address, decimals]);

  if (!balance || !provider) return null;

  return (
    <>
      {balance} {symbol}
    </>
  );
}

function Update({ wallet, onSubmit, onRemove }: Props) {
  const form = useForm({
    mode: "onBlur",
    resolver: zodResolver(updateSchema),
    defaultValues: wallet,
  });

  return (
    <Form form={form} onSubmit={onSubmit}>
      <Form.Text label="Name" name="name" />
      <Form.Text label="Derivation Path" name="derivationPath" />
      <Form.NumberField label="Address count" name="count" />
      <div className="flex gap-2">
        <Form.Submit label="Save" />
        <Button color="warning" onClick={onRemove}>
          Remove
        </Button>
      </div>
    </Form>
  );
}
