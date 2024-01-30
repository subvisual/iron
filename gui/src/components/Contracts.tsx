import {zodResolver} from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  TextField,
} from "@mui/material";
import {FieldValues, useForm} from "react-hook-form";
import {Address} from "viem";
import {z} from "zod";
import {useState} from "react";

import {useApi} from "@/hooks";
import {useContracts, useNetworks} from "@/store";
import {
  ABIForm,
  AddressView,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "./";
import {Navbar} from "./Home/Navbar";
import SearchBar from "./SearchBar";

export function Contracts() {
  const [searchTerm, setSearchTerm] = useState<[`0x${string}`, string] | null>(
    null
  );
  const chainId = useNetworks((s) => s.current?.chain_id);
  const {data: contracts} = useApi<[`0x${string}`, string][]>("/contracts", {
    chainId,
  });

  if (!chainId || !contracts) return null;

  const handleSearch = (contract: [`0x${string}`, string] | null) => {
    setSearchTerm(contract);
  };

  let filteredContracts = contracts;
  if (searchTerm !== null) {
    filteredContracts = [searchTerm];
  }

  return (
    <>
      <Navbar>Contracts</Navbar>
      <Box sx={{p: 2}}>
        <SearchBar onSelect={handleSearch} />
      </Box>
      {filteredContracts.map(([address, name]) => (
        <Contract key={address} address={address} name={name} />
      ))}
      {filteredContracts.length === 0 && <AddressForm />}
    </>
  );
}

function Contract({address, name}: {address: Address; name: string}) {
  const chainId = useNetworks((s) => s.current?.chain_id);

  if (!chainId) return null;

  return (
    <Accordion>
      <AccordionSummary>
        <AddressView address={address} />
        <Chip sx={{marginLeft: 2}} label={name} />
      </AccordionSummary>
      <AccordionDetails>
        <ABIForm address={address} chainId={chainId} />
      </AccordionDetails>
    </Accordion>
  );
}

function AddressForm() {
  const schema = z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid format"),
  });

  const add = useContracts((s) => s.add);

  const {
    handleSubmit,
    formState: {isValid, errors, isSubmitting},
    register,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FieldValues) => add(data.address);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack direction='row' spacing={2}>
        <TextField
          label='Contract Address'
          error={!!errors.address}
          helperText={errors.address?.message?.toString() || ""}
          fullWidth
          {...register("address")}
        />
        <Button
          variant='contained'
          type='submit'
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? <CircularProgress /> : "Add"}
        </Button>
      </Stack>
    </form>
  );
}
