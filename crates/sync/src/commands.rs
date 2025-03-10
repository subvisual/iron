use ethui_db::Db;
use ethui_networks::Networks;
use ethui_types::{Address, GlobalState, U256};

use crate::{Error, Result};

#[tauri::command]
pub async fn sync_alchemy_is_network_supported(chain_id: u32) -> bool {
    ethui_sync_alchemy::supports_network(chain_id)
}

#[tauri::command]
pub async fn sync_get_native_balance(
    chain_id: u32,
    address: Address,
    db: tauri::State<'_, Db>,
) -> Result<U256> {
    let network = Networks::read()
        .await
        .get_network(chain_id)
        .ok_or(Error::InvalidNetwork(chain_id))?;

    // TODO: check with networks if this is anvil or not
    if network.is_dev().await {
        Ok(ethui_sync_anvil::get_native_balance(network.http_url.to_string(), address).await?)
    } else {
        Ok(db.get_native_balance(chain_id, address).await)
    }
}
