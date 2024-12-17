"use client"
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultConfig } from "connectkit";
import { lenstestnet } from "./customChains";
import ConnectKit from "./ConnectKit";
import { ThemeProvider } from "next-themes";
export const config = createConfig(
  getDefaultConfig({
    chains: [lenstestnet],
    transports: {
      [lenstestnet.id]: http(`${lenstestnet?.rpcUrls?.default}`)
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '123',
    appName: "PdogFun",
    appDescription: "Designed to simplify the creation of meme coins. Allows anyone to quickly and easily launch their own meme token without deep technical knowledge.",
    appUrl: "https://pdog.fun",
    appIcon: "https://pdog.fun/favicon.ico",
  }),
);

const queryClient = new QueryClient();


export default function Provider({ children }: { children: React.ReactNode; }) {
  return (
    <ThemeProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectKit>{children}</ConnectKit>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  )
}
