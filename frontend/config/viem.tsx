import { chains } from '@lens-network/sdk/viem'
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
 
export const walletClient = createWalletClient({
  chain: chains.testnet,
  transport: custom(window.ethereum)
})
 
// JSON-RPC Account
export const [account] = await walletClient.getAddresses()