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
    default: { http: ["https://rpc.testnet.lens.xyz"] },
  },
  blockExplorers: {
    default: { name: "Lens Test Explorer", url: "https://explorer.testnet.lens.xyz" },
  },
  testnet: true,
};