import "@matterlabs/hardhat-zksync";
import "@nomicfoundation/hardhat-toolbox";


import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000,
      },
     // viaIR: true,
    },
  },
  zksolc: {
    version: "latest",
    settings: {},
  },
  networks: {
    lensTestnet: {
      chainId: 37111,
      ethNetwork: "sepolia", 
      url: "https://rpc.testnet.lens.dev",
      verifyURL:"https://block-explorer-verify.testnet.lens.dev/contract_verificatio",
      zksync: true,
    },
    hardhat: {
      zksync: true,
      //loggingEnabled: true,
    },
  },
};

export default config;
