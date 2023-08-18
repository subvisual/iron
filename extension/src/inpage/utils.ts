import { ethErrors } from "eth-rpc-errors";
import { request } from "http";
import {
  JsonRpcMiddleware,
  PendingJsonRpcResponse,
  createIdRemapMiddleware,
} from "json-rpc-engine";
import log from "loglevel";

import { UnvalidatedSingleOrBatchRequest } from "./types";

export type Maybe<T> = T | null | undefined;

// Constants

export const EMITTED_NOTIFICATIONS = Object.freeze([
  "eth_subscription", // per eth-json-rpc-filters/subscriptionManager
]);

// Utility functions

/**
 * Gets the default middleware for external providers, consisting of an ID
 * remapping middleware and an error middleware.
 *
 * @param logger - The logger to use in the error middleware.
 * @returns An array of json-rpc-engine middleware functions.
 */
export const getDefaultExternalMiddleware = () => [
  createIdRemapMiddleware(),
  createErrorMiddleware(),
];

/**
 * json-rpc-engine middleware that logs RPC errors and and validates req.method.
 *
 * @param log - The logging API to use.
 * @returns A json-rpc-engine middleware function.
 */
function createErrorMiddleware(): JsonRpcMiddleware<unknown, unknown> {
  return (req, res, next) => {
    // json-rpc-engine will terminate the request when it notices this error
    if (typeof req.method !== "string" || !req.method) {
      res.error = ethErrors.rpc.invalidRequest({
        message: `The request 'method' must be a non-empty string.`,
        data: req,
      });
    }

    next((done) => {
      const { error } = res;
      if (!error) {
        return done();
      }
      log.error(`Iron - RPC Error: ${error.message}`, error, req);
      return done();
    });
  };
}

// resolve response.result or response, reject errors
export function getRpcPromiseCallback(
  resolve: (value?: unknown) => void,
  reject: (error?: Error) => void
) {
  return (error: Error, response: PendingJsonRpcResponse<unknown>): void => {
    if (error || response.error) {
      reject(error || response.error);
    } else {
      const result = Array.isArray(response) ? response : response.result;

      resolve(result);
    }
  };
}

/**
 * Checks whether the given chain ID is valid, meaning if it is non-empty,
 * '0x'-prefixed string.
 *
 * @param chainId - The chain ID to validate.
 * @returns Whether the given chain ID is valid.
 */
export const isValidChainId = (chainId: unknown): chainId is string =>
  Boolean(chainId) && typeof chainId === "string" && chainId.startsWith("0x");

/**
 * Checks whether the given network version is valid, meaning if it is non-empty
 * string.
 *
 * @param networkVersion - The network version to validate.
 * @returns Whether the given network version is valid.
 */
export const isValidNetworkVersion = (
  networkVersion: unknown
): networkVersion is string =>
  Boolean(networkVersion) && typeof networkVersion === "string";
