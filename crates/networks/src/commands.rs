use ethui_types::{GlobalState, Network, NewNetworkParams};

use super::{Networks, Result};

#[tauri::command]
pub async fn networks_get_current() -> Result<Network> {
    let networks = Networks::read().await;

    Ok(networks.get_current().clone())
}

#[tauri::command]
pub async fn networks_get_list() -> Result<Vec<Network>> {
    let networks = Networks::read().await;

    Ok(networks.inner.networks.values().cloned().collect())
}

#[tauri::command]
pub async fn networks_set_current(network: String) -> Result<Network> {
    let mut networks = Networks::write().await;

    networks.set_current_by_name(network).await?;

    Ok(networks.get_current().clone())
}

#[tauri::command]
pub async fn networks_add(network: NewNetworkParams) -> Result<()> {
    let mut networks = Networks::write().await;
    networks.add_network(network).await?;
    Ok(())
}

#[tauri::command]
pub async fn networks_update(old_name: String, network: Network) -> Result<()> {
    let mut networks = Networks::write().await;
    networks.update_network(&old_name, network).await?;
    Ok(())
}

#[tauri::command]
pub async fn networks_remove(name: String) -> Result<()> {
    let mut networks = Networks::write().await;
    networks.remove_network(&name).await?;
    Ok(())
}

#[tauri::command]
pub async fn networks_chain_id_from_provider(url: String) -> Result<u64> {
    let networks = Networks::read().await;

    networks.chain_id_from_provider(url).await
}
