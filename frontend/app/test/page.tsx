"use client"; // 确保组件以客户端模式运行

import { useEffect } from "react";
import { Address, privateKeyToAccount } from "viem/accounts";
import { client } from "@/lib/client";
import { storageClient } from "@/lib/StorageNode";
import { createApp, fetchApp } from "@lens-protocol/client/actions";
import { handleWith } from "@lens-protocol/client/viem";
import { app } from "@lens-protocol/metadata";
import { chains } from "@lens-network/sdk/viem";
import { createWalletClient, custom } from "viem";

export default function DeployLensAppPage() {
  useEffect(() => {
    const deployLensApp = async () => {
      try {
        // 请求账户地址
        const [address] = (await window.ethereum.request({
          method: "eth_requestAccounts",
        })) as [Address];

        // 创建 Wallet 客户端
        const walletClient = createWalletClient({
          account: address,
          chain: chains.testnet,
          transport: custom(window.ethereum),
        });

        // Step 1: 创建 Metadata
        const metadata = app({
          name: "PdogFun",
          tagline: "Meme Launch",
          description: "Designed to simplify the creation of meme coins...",
          logo: "lens://789d4cc006440c77228bdbdd8d65abc0281fe5f36cdf33762666fd985def3826",
          developer: "Jiangban ceo@coolha.com",
          url: "https://pdog.fun",
          termsOfService: "https://pdog.fun/terms",
          privacyPolicy: "https://pdog.fun/privacy",
          platforms: [],
        });

        // Step 2: 上传 Metadata
        const { uri } = await storageClient.uploadAsJson(metadata);
        console.log("Metadata URI:", uri);

        // Step 3: 以 Builder 身份认证
        const signer = privateKeyToAccount(process.env.APP_PRIVATE_KEY as `0x${string}`);
        const authenticated = await client.login({
          builder: {
            address: signer.address,
          },
          signMessage: (message) => signer.signMessage({ message }),
        });

        if (authenticated.isErr()) {
          throw new Error(`Authentication Error: ${authenticated.error}`);
        }
        const sessionClient = authenticated.value;

        // Step 4: 部署应用程序合约
        const result = await createApp(sessionClient, {
          metadataUri: uri,
        })
          .andThen(handleWith(walletClient))
          .andThen(sessionClient.waitForTransaction)
          .andThen((txHash) => fetchApp(sessionClient, { txHash }));

        if (result.isErr()) {
          throw new Error(`App Deployment Error: ${result.error}`);
        }

        console.log("Deployed App:", result.value);
      } catch (error) {
        console.error("Deployment Error:", error);
      }
    };

    deployLensApp();
  }, []);

  return <div>Deploying Lens App...</div>;
}
