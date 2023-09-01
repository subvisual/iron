import { OpenInNew } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton, Typography } from "@mui/material";
import { SnackbarKey, useSnackbar } from "notistack";
import { useEffect } from "react";

import { useNetworks, useSettingsWindow } from "../store";
import { GeneralSettings } from "../types";
import { useInvoke } from "./tauri";
import { useRefreshSettings } from "./useRefreshSettings";

let key: SnackbarKey;

export function useNoticeAlchemyKeyMissing() {
  const { open } = useSettingsWindow();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const currentNetwork = useNetworks((s) => s.current);

  const {
    data: settings,
    mutate,
    isLoading: isLoadingSettings,
  } = useInvoke<GeneralSettings>("settings_get");

  useRefreshSettings(() => mutate);

  const { data: isSupportedNetwork, isLoading: isLoadingSupportedNetwork } =
    useInvoke<boolean>("alchemy_supported_network", {
      chainId: currentNetwork?.chain_id,
    });

  const isLoading = isLoadingSettings || isLoadingSupportedNetwork;

  const requiresAlchemyKey =
    !isLoading && isSupportedNetwork && !settings?.alchemyApiKey;

  useEffect(() => {
    if (!requiresAlchemyKey) return closeSnackbar(key);

    key = enqueueSnackbar(
      <>
        <Typography>Alchemy key missing</Typography>
      </>,
      {
        key: "alchemy_key_missing",
        preventDuplicate: true,
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
        persist: true,
        variant: "warning",
        action: () => (
          <>
            <IconButton
              aria-label="close"
              color="inherit"
              sx={{ p: 0.5 }}
              onClick={() => open()}
            >
              <OpenInNew />
            </IconButton>
            <IconButton
              aria-label="close"
              color="inherit"
              sx={{ p: 0.5 }}
              onClick={() => closeSnackbar(key)}
            >
              <CloseIcon />
            </IconButton>
          </>
        ),
      }
    );
  }, [closeSnackbar, enqueueSnackbar, open, requiresAlchemyKey]);
}
