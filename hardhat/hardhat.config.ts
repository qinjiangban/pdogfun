import "@matterlabs/hardhat-zksync";
import "@matterlabs/hardhat-zksync-solc";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-solhint";

import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
  },
  zksolc: {
    //version: "1.5.8",
    compilerSource: "binary",
    settings: {
      // 使用短路径替代路径中的空格
      compilerPath: "C:\\Users\\QINJIA~1\\AppData\\Local\\hardhat-nodejs\\Cache\\compilers-v2\\zksolc\\zksolc-v1.5.8",
      optimizer: {
        enabled: true, // 启用优化器
        runs: 200,
      },
    },
  },
  networks: {
    lensTestnet: {
      chainId: 37111,
      ethNetwork: "sepolia", 
      url: "https://api.staging.lens.zksync.dev",
      verifyURL:
        "https://api-explorer-verify.staging.lens.zksync.dev/contract_verification",
      zksync: true,
    },
    hardhat: {
      zksync: true,
      loggingEnabled: true,
    },
  },
};

export default config;
