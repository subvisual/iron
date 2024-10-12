/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as OnboardingImport } from './routes/onboarding'
import { Route as HomeImport } from './routes/_home'
import { Route as DialogImport } from './routes/_dialog'
import { Route as HomeHomeAccountImport } from './routes/_home.home/account'
import { Route as DialogDialogWalletUnlockIdImport } from './routes/_dialog.dialog/wallet-unlock.$id'
import { Route as DialogDialogTxReviewIdImport } from './routes/_dialog.dialog/tx-review.$id'
import { Route as DialogDialogMsgSignIdImport } from './routes/_dialog.dialog/msg-sign.$id'
import { Route as DialogDialogErc721AddIdImport } from './routes/_dialog.dialog/erc721-add.$id'
import { Route as DialogDialogErc20AddIdImport } from './routes/_dialog.dialog/erc20-add.$id'
import { Route as DialogDialogErc1155AddIdImport } from './routes/_dialog.dialog/erc1155-add.$id'
import { Route as DialogDialogChainAddIdImport } from './routes/_dialog.dialog/chain-add.$id'

// Create Virtual Routes

const HomeHomeTransactionsLazyImport = createFileRoute(
  '/_home/home/transactions',
)()
const HomeHomeContractsLazyImport = createFileRoute('/_home/home/contracts')()
const HomeHomeConnectionsLazyImport = createFileRoute(
  '/_home/home/connections',
)()

// Create/Update Routes

const OnboardingRoute = OnboardingImport.update({
  path: '/onboarding',
  getParentRoute: () => rootRoute,
} as any)

const HomeRoute = HomeImport.update({
  id: '/_home',
  getParentRoute: () => rootRoute,
} as any)

const DialogRoute = DialogImport.update({
  id: '/_dialog',
  getParentRoute: () => rootRoute,
} as any)

const HomeHomeTransactionsLazyRoute = HomeHomeTransactionsLazyImport.update({
  path: '/home/transactions',
  getParentRoute: () => HomeRoute,
} as any).lazy(() =>
  import('./routes/_home.home/transactions.lazy').then((d) => d.Route),
)

const HomeHomeContractsLazyRoute = HomeHomeContractsLazyImport.update({
  path: '/home/contracts',
  getParentRoute: () => HomeRoute,
} as any).lazy(() =>
  import('./routes/_home.home/contracts.lazy').then((d) => d.Route),
)

const HomeHomeConnectionsLazyRoute = HomeHomeConnectionsLazyImport.update({
  path: '/home/connections',
  getParentRoute: () => HomeRoute,
} as any).lazy(() =>
  import('./routes/_home.home/connections.lazy').then((d) => d.Route),
)

const HomeHomeAccountRoute = HomeHomeAccountImport.update({
  path: '/home/account',
  getParentRoute: () => HomeRoute,
} as any)

const DialogDialogWalletUnlockIdRoute = DialogDialogWalletUnlockIdImport.update(
  {
    path: '/dialog/wallet-unlock/$id',
    getParentRoute: () => DialogRoute,
  } as any,
)

const DialogDialogTxReviewIdRoute = DialogDialogTxReviewIdImport.update({
  path: '/dialog/tx-review/$id',
  getParentRoute: () => DialogRoute,
} as any)

const DialogDialogMsgSignIdRoute = DialogDialogMsgSignIdImport.update({
  path: '/dialog/msg-sign/$id',
  getParentRoute: () => DialogRoute,
} as any)

const DialogDialogErc721AddIdRoute = DialogDialogErc721AddIdImport.update({
  path: '/dialog/erc721-add/$id',
  getParentRoute: () => DialogRoute,
} as any)

const DialogDialogErc20AddIdRoute = DialogDialogErc20AddIdImport.update({
  path: '/dialog/erc20-add/$id',
  getParentRoute: () => DialogRoute,
} as any)

const DialogDialogErc1155AddIdRoute = DialogDialogErc1155AddIdImport.update({
  path: '/dialog/erc1155-add/$id',
  getParentRoute: () => DialogRoute,
} as any)

const DialogDialogChainAddIdRoute = DialogDialogChainAddIdImport.update({
  path: '/dialog/chain-add/$id',
  getParentRoute: () => DialogRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_dialog': {
      id: '/_dialog'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof DialogImport
      parentRoute: typeof rootRoute
    }
    '/_home': {
      id: '/_home'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof HomeImport
      parentRoute: typeof rootRoute
    }
    '/onboarding': {
      id: '/onboarding'
      path: '/onboarding'
      fullPath: '/onboarding'
      preLoaderRoute: typeof OnboardingImport
      parentRoute: typeof rootRoute
    }
    '/_home/home/account': {
      id: '/_home/home/account'
      path: '/home/account'
      fullPath: '/home/account'
      preLoaderRoute: typeof HomeHomeAccountImport
      parentRoute: typeof HomeImport
    }
    '/_home/home/connections': {
      id: '/_home/home/connections'
      path: '/home/connections'
      fullPath: '/home/connections'
      preLoaderRoute: typeof HomeHomeConnectionsLazyImport
      parentRoute: typeof HomeImport
    }
    '/_home/home/contracts': {
      id: '/_home/home/contracts'
      path: '/home/contracts'
      fullPath: '/home/contracts'
      preLoaderRoute: typeof HomeHomeContractsLazyImport
      parentRoute: typeof HomeImport
    }
    '/_home/home/transactions': {
      id: '/_home/home/transactions'
      path: '/home/transactions'
      fullPath: '/home/transactions'
      preLoaderRoute: typeof HomeHomeTransactionsLazyImport
      parentRoute: typeof HomeImport
    }
    '/_dialog/dialog/chain-add/$id': {
      id: '/_dialog/dialog/chain-add/$id'
      path: '/dialog/chain-add/$id'
      fullPath: '/dialog/chain-add/$id'
      preLoaderRoute: typeof DialogDialogChainAddIdImport
      parentRoute: typeof DialogImport
    }
    '/_dialog/dialog/erc1155-add/$id': {
      id: '/_dialog/dialog/erc1155-add/$id'
      path: '/dialog/erc1155-add/$id'
      fullPath: '/dialog/erc1155-add/$id'
      preLoaderRoute: typeof DialogDialogErc1155AddIdImport
      parentRoute: typeof DialogImport
    }
    '/_dialog/dialog/erc20-add/$id': {
      id: '/_dialog/dialog/erc20-add/$id'
      path: '/dialog/erc20-add/$id'
      fullPath: '/dialog/erc20-add/$id'
      preLoaderRoute: typeof DialogDialogErc20AddIdImport
      parentRoute: typeof DialogImport
    }
    '/_dialog/dialog/erc721-add/$id': {
      id: '/_dialog/dialog/erc721-add/$id'
      path: '/dialog/erc721-add/$id'
      fullPath: '/dialog/erc721-add/$id'
      preLoaderRoute: typeof DialogDialogErc721AddIdImport
      parentRoute: typeof DialogImport
    }
    '/_dialog/dialog/msg-sign/$id': {
      id: '/_dialog/dialog/msg-sign/$id'
      path: '/dialog/msg-sign/$id'
      fullPath: '/dialog/msg-sign/$id'
      preLoaderRoute: typeof DialogDialogMsgSignIdImport
      parentRoute: typeof DialogImport
    }
    '/_dialog/dialog/tx-review/$id': {
      id: '/_dialog/dialog/tx-review/$id'
      path: '/dialog/tx-review/$id'
      fullPath: '/dialog/tx-review/$id'
      preLoaderRoute: typeof DialogDialogTxReviewIdImport
      parentRoute: typeof DialogImport
    }
    '/_dialog/dialog/wallet-unlock/$id': {
      id: '/_dialog/dialog/wallet-unlock/$id'
      path: '/dialog/wallet-unlock/$id'
      fullPath: '/dialog/wallet-unlock/$id'
      preLoaderRoute: typeof DialogDialogWalletUnlockIdImport
      parentRoute: typeof DialogImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  DialogRoute: DialogRoute.addChildren({
    DialogDialogChainAddIdRoute,
    DialogDialogErc1155AddIdRoute,
    DialogDialogErc20AddIdRoute,
    DialogDialogErc721AddIdRoute,
    DialogDialogMsgSignIdRoute,
    DialogDialogTxReviewIdRoute,
    DialogDialogWalletUnlockIdRoute,
  }),
  HomeRoute: HomeRoute.addChildren({
    HomeHomeAccountRoute,
    HomeHomeConnectionsLazyRoute,
    HomeHomeContractsLazyRoute,
    HomeHomeTransactionsLazyRoute,
  }),
  OnboardingRoute,
})

/* prettier-ignore-end */
