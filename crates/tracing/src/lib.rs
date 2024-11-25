mod error;

pub use error::{TracingError, TracingResult};
use tracing::instrument;
use tracing_subscriber::{
    fmt::{self},
    layer::SubscriberExt as _,
    reload,
    util::SubscriberInitExt as _,
    EnvFilter, Registry,
};

use once_cell::sync::OnceCell;

static RELOAD_HANDLE: OnceCell<reload::Handle<EnvFilter, Registry>> = OnceCell::new();

pub fn init() -> TracingResult<()> {
    let filter = EnvFilter::from_default_env();
    let (filter, reload_handle) = reload::Layer::new(filter);
    RELOAD_HANDLE.set(reload_handle).unwrap();

    let subscriber = tracing_subscriber::registry();

    #[cfg(not(feature = "dev"))]
    subscriber.with(filter).init();

    #[cfg(feature = "dev")]
    {
        dbg!("here");
        use tracing_perfetto::PerfettoLayer;
        let cli_layer = fmt::Layer::new();
        let perfetto_layer = PerfettoLayer::new(std::sync::Mutex::new(
            std::fs::File::create("/tmp/ethui-dev.pftrace").unwrap(),
        ));
        subscriber
            .with(filter)
            .with(perfetto_layer)
            .with(cli_layer)
            //.with(filter)
            //.with(cli_layer)
            .init();
    }

    Ok(())
}

pub fn parse(directives: &str) -> TracingResult<EnvFilter> {
    Ok(EnvFilter::try_new(directives)?)
}

#[instrument(skip(directives))]
pub fn reload(directives: &str) -> TracingResult<()> {
    let new_filter = parse(directives)?;

    RELOAD_HANDLE
        .get()
        .ok_or(TracingError::ReloadHandleNotSet)?
        .modify(|filter| *filter = new_filter)?;

    Ok(())
}
