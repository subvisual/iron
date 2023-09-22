use iron_broadcast::InternalMsg;
use iron_settings::Settings;
use iron_types::GlobalState;

use crate::Forge;

pub async fn init() -> crate::Result<()> {
    tokio::spawn(async { receiver().await });

    let settings = Settings::read().await;

    if let (true, Some(path)) = (
        settings.inner.abi_watch,
        settings.inner.abi_watch_path.clone(),
    ) {
        Forge::start(path).await
    } else {
        Ok(())
    }
}

async fn receiver() -> ! {
    let mut rx = iron_broadcast::subscribe_internal().await;

    let (mut enabled, mut path) = {
        let settings = Settings::read().await;

        (
            settings.inner.abi_watch,
            settings.inner.abi_watch_path.clone(),
        )
    };

    loop {
        if let Ok(msg) = rx.recv().await {
            use InternalMsg::*;

            if let SettingsUpdated = msg {
                let settings = Settings::read().await;
                let new_enabled = settings.inner.abi_watch;
                let new_path = settings.inner.abi_watch_path.clone();

                if (enabled, &path) == (new_enabled, &new_path) {
                    continue;
                }

                dbg!("here");

                let _ = Forge::stop().await;

                if let (true, Some(path)) = (new_enabled, new_path.clone()) {
                    let _ = Forge::start(path).await;
                }

                enabled = new_enabled;
                path = new_path;
            }
        }
    }
}
