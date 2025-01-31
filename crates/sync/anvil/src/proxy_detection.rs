enum ProxyInfo {
    None,
    Eip1167(Address),
}

pub async fn detect_proxy(provider: &RootProvider<Http<Client>>) -> ProxyInfo {}
