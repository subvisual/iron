use alloy::{
    network::Ethereum,
    providers::{ext::AnvilApi, ProviderBuilder, RootProvider},
    rpc::client::ClientBuilder,
    transports::{layers::RetryBackoffLayer, RpcError, TransportErrorKind},
};
use serde::{Deserialize, Serialize};
use url::Url;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Network {
    pub name: String,
    pub chain_id: u32,
    pub explorer_url: Option<String>,
    // TODO: turn this into a Url
    pub http_url: String,
    // TODO: turn this into an Option<Url>
    pub ws_url: Option<String>,
    pub currency: String,
    pub decimals: u32,
}

impl Network {
    pub fn mainnet() -> Self {
        Self {
            name: String::from("Mainnet"),
            chain_id: 1,
            explorer_url: Some(String::from("https://etherscan.io/search?q=")),
            http_url: String::from("https://eth.llamarpc.com"),
            ws_url: None,
            currency: String::from("ETH"),
            decimals: 18,
        }
    }

    pub fn sepolia() -> Self {
        Self {
            name: String::from("Sepolia"),
            chain_id: 11155111,
            explorer_url: Some(String::from("https://sepolia.etherscan.io/search?q=")),
            http_url: String::from("https://ethereum-sepolia-rpc.publicnode.com"),
            ws_url: None,
            currency: String::from("ETH"),
            decimals: 18,
        }
    }

    pub fn anvil() -> Self {
        Self {
            name: String::from("Anvil"),
            chain_id: 31337,
            explorer_url: None,
            http_url: String::from("http://localhost:8545"),
            ws_url: Some(String::from("ws://localhost:8545")),
            currency: String::from("ETH"),
            decimals: 18,
        }
    }

    pub fn all_default() -> Vec<Self> {
        vec![Self::anvil(), Self::mainnet(), Self::sepolia()]
    }

    pub fn chain_id_hex(&self) -> String {
        format!("0x{:x}", self.chain_id)
    }

    pub fn ws_url(&self) -> String {
        self.ws_url
            .clone()
            .unwrap_or_else(|| self.http_url.clone().replace("http", "ws"))
    }

    pub async fn is_dev(&self) -> bool {
        let provider = self.get_alloy_provider().await.unwrap();
        // TODO cache node_info for entire chain
        self.chain_id == 31337 || provider.anvil_node_info().await.is_ok()
    }

    pub async fn get_alloy_provider(
        &self,
    ) -> Result<RootProvider<Ethereum>, RpcError<TransportErrorKind>> {
        ProviderBuilder::new()
            .disable_recommended_fillers()
            .on_builtin(&self.http_url)
            .await
    }

    pub fn get_provider(&self) -> RootProvider<Ethereum> {
        let url = Url::parse(&self.http_url).unwrap();

        //let url = Url::parse(&self.http_url).unwrap();
        let client = ClientBuilder::default()
            .layer(RetryBackoffLayer::new(10, 500, 300))
            .http(url);

        ProviderBuilder::new()
            .disable_recommended_fillers()
            .on_client(client)
        //let url = Url::parse(&self.http_url).unwrap();
        //let http = Http::new(url);
        //let policy = Box::<HttpRateLimitRetryPolicy>::default();
        //let client = RetryClientBuilder::default()
        //    .rate_limit_retries(10)
        //    .timeout_retries(3)
        //    .initial_backoff(Duration::from_millis(500))
        //    .build(http, policy);
        //Provider::new(client)
    }

    pub async fn reset_listener(&self) -> Result<(), RpcError<TransportErrorKind>> {
        Ok(())
    }
}

impl std::fmt::Display for Network {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}-{}", self.chain_id, self.name)
    }
}
