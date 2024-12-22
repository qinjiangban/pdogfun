'use client'
import { type Chain } from "viem";

export const lenstestnet: Chain = {
  id: 37111,
  name: "Lens Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Avalanche",
    symbol: "GRASS",
  },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.lens.dev"] },
  },
  blockExplorers: {
    default: { name: "Lens Block Explorer", url: "https://block-explorer.testnet.lens.dev" },
  },
  testnet: true,
};