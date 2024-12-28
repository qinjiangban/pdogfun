import { PublicClient, testnet } from "@lens-protocol/client";

export const client = PublicClient.create({
  environment: testnet,
  //origin: "https://pdog.fun", // Ignored if running in a browser
});