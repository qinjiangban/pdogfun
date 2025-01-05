import "viem/window";

import { Address, createWalletClient, custom } from "viem";
import { chains } from "@lens-network/sdk/viem";
import { eip712WalletActions } from "viem/zksync";
// For more information on hoisting accounts,
// visit: https://viem.sh/docs/accounts/local.html#optional-hoist-the-account
export const walletClient = createWalletClient({
    chain: chains.testnet,
    transport: custom(window.ethereum)
  }).extend(eip712WalletActions())

// JSON-RPC Account
export const [account] = await walletClient.getAddresses()