import { Wallet, Provider } from "zksync-ethers";
import * as ethers from "ethers";
import * as dotenv from "dotenv";
import { HardhatRuntimeEnvironment } from "hardhat/types";

dotenv.config();

const deploy = async (hre: HardhatRuntimeEnvironment) => {
  // 从环境变量加载钱包私钥
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not set in .env file");
  }

  // 创建 zkSync provider 和钱包实例
  const zkSyncProvider = new Provider(hre.config.networks.lensTestnet.url);
  const wallet = new Wallet(PRIVATE_KEY, zkSyncProvider);

  console.log("Deploying contract using wallet:", wallet.address);

  // 获取合约编译结果
  const artifact = await hre.artifacts.readArtifact("PumpFunToken");

  // 初始化合约工厂
  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  // 部署合约（传递构造函数参数）
  const name = "PumpFunToken";
  const symbol = "PFT";
  const initialSupply = ethers.utils.parseEther("1000000"); // 初始供应量为 100 万单位
  const metadataUrl = "https://example.com/metadata.json";

  const contract = await factory.deploy(name, symbol, initialSupply, metadataUrl);

  console.log("Deploying contract, transaction hash:", contract.deployTransaction.hash);

  // 等待部署完成
  await contract.deployed();

  console.log("Contract deployed at address:", contract.address);
};

export default deploy;
