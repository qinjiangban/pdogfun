'use client'
import { storageClient } from './storageClient';
import { lensAccountOnly } from '@lens-chain/storage-client';
import { chains } from '@lens-chain/sdk/viem';

// 代币数据接口
export interface TokenData {
  name: string;
  symbol: string;
  initialSupply: number;
  bio: string;
  logo: string;
  webSite?: string;
  lensSite?: string;
  xSite?: string;
  telegramSite?: string;
  metadataUri: string;
  contractAddress: string; // 合约地址（必填）
  transactionHash: string;
  createdAt: string;
  creator: string; // 部署者钱包地址
  logoStorageKey?: string; // LOGO在Grove中的存储key
  metadataStorageKey?: string; // 元数据在Grove中的存储key
}

// 代币列表数据接口
export interface TokenListData {
  tokens: TokenData[]; // 直接存储完整的代币数据
  lastUpdated: string;
  totalCount: number;
}

// 管理员权限检查
export const ADMIN_ADDRESS = '0xcd284038f2E68c6A43b04695f84377f38686eE56';

export function isAdmin(address: string): boolean {
  return address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
}

// Lens Grove存储管理类
export class LensGroveTokenManager {
  private static readonly TOKEN_LIST_KEY = 'pdogfun_token_list';

  // 保存新部署的代币到Lens Grove
  static async saveTokenToList(tokenData: TokenData, walletAddress: string): Promise<void> {
    try {
      // 创建ACL配置 - 使用管理员地址确保数据可管理
      const acl = lensAccountOnly(ADMIN_ADDRESS, chains.testnet.id);
      
      // 获取现有的代币列表
      const existingList = await this.getTokenList();
      
      // 检查是否已存在相同合约地址的代币
      const existingTokenIndex = existingList.tokens.findIndex(
        token => token.contractAddress.toLowerCase() === tokenData.contractAddress.toLowerCase()
      );
      
      let updatedTokens: TokenData[];
      if (existingTokenIndex >= 0) {
        // 更新现有代币
        updatedTokens = [...existingList.tokens];
        updatedTokens[existingTokenIndex] = tokenData;
      } else {
        // 添加新代币到列表开头
        updatedTokens = [tokenData, ...existingList.tokens];
      }
      
      const tokenListData: TokenListData = {
        tokens: updatedTokens,
        lastUpdated: new Date().toISOString(),
        totalCount: updatedTokens.length
      };
      
      // 上传更新后的列表到Lens Grove
      const { uri } = await storageClient.uploadAsJson(tokenListData, { acl });
      
      // 将URI保存到localStorage作为索引
      localStorage.setItem(this.TOKEN_LIST_KEY, uri);
      
      console.log('Token list updated successfully:', uri);
    } catch (error) {
      console.error('Error saving token to list:', error);
      throw error;
    }
  }

  // 从Lens Grove获取代币列表
  static async getTokenList(): Promise<TokenListData> {
    try {
      const listUri = localStorage.getItem(this.TOKEN_LIST_KEY);
      
      if (!listUri) {
        return { tokens: [], lastUpdated: new Date().toISOString(), totalCount: 0 };
      }
      
      const listUrl = await storageClient.resolve(listUri);
      const response = await fetch(listUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // 兼容旧数据格式
      if (Array.isArray(data.tokens) && data.tokens.length > 0 && typeof data.tokens[0] === 'string') {
        // 旧格式：tokens是URI数组，需要转换
        return { tokens: [], lastUpdated: new Date().toISOString(), totalCount: 0 };
      }
      
      return {
        tokens: data.tokens || [],
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        totalCount: data.totalCount || (data.tokens ? data.tokens.length : 0)
      };
    } catch (error) {
      console.error('Error loading token list:', error);
      return { tokens: [], lastUpdated: new Date().toISOString(), totalCount: 0 };
    }
  }

  // 获取metadata URI列表（用于首页显示）
  static async getMetadataUris(): Promise<string[]> {
    const tokenList = await this.getTokenList();
    return tokenList.tokens.map(token => {
      // 从完整的metadata URL中提取URI key
      const match = token.metadataUri.match(/grove\.storage\/([a-f0-9]+)/);
      return match ? match[1] : '';
    }).filter(uri => uri !== '');
  }

  // 获取所有代币数据（用于首页显示）
  static async getAllTokens(): Promise<TokenData[]> {
    const tokenList = await this.getTokenList();
    return tokenList.tokens;
  }

  // 根据创建者地址过滤代币
  static async getTokensByCreator(creatorAddress: string): Promise<TokenData[]> {
    try {
      const tokenList = await this.getTokenList();
      return tokenList.tokens.filter(token => 
        token.creator.toLowerCase() === creatorAddress.toLowerCase()
      );
    } catch (error) {
      console.error('Error getting tokens by creator:', error);
      return [];
    }
  }

  // 管理员删除代币
  static async deleteToken(contractAddress: string, adminAddress: string): Promise<boolean> {
    try {
      if (!isAdmin(adminAddress)) {
        throw new Error('Unauthorized: Admin access required');
      }

      const tokenList = await this.getTokenList();
      const updatedTokens = tokenList.tokens.filter(
        token => token.contractAddress.toLowerCase() !== contractAddress.toLowerCase()
      );

      const tokenListData: TokenListData = {
        tokens: updatedTokens,
        lastUpdated: new Date().toISOString(),
        totalCount: updatedTokens.length
      };

      const acl = lensAccountOnly(ADMIN_ADDRESS, chains.testnet.id);
      const { uri } = await storageClient.uploadAsJson(tokenListData, { acl });
      localStorage.setItem(this.TOKEN_LIST_KEY, uri);

      console.log('Token deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting token:', error);
      return false;
    }
  }

  // 管理员编辑代币
  static async updateToken(updatedToken: TokenData, adminAddress: string): Promise<boolean> {
    try {
      if (!isAdmin(adminAddress)) {
        throw new Error('Unauthorized: Admin access required');
      }

      const tokenList = await this.getTokenList();
      const tokenIndex = tokenList.tokens.findIndex(
        token => token.contractAddress.toLowerCase() === updatedToken.contractAddress.toLowerCase()
      );

      if (tokenIndex === -1) {
        throw new Error('Token not found');
      }

      const updatedTokens = [...tokenList.tokens];
      updatedTokens[tokenIndex] = { ...updatedToken, lastUpdated: new Date().toISOString() };

      const tokenListData: TokenListData = {
        tokens: updatedTokens,
        lastUpdated: new Date().toISOString(),
        totalCount: updatedTokens.length
      };

      const acl = lensAccountOnly(ADMIN_ADDRESS, chains.testnet.id);
      const { uri } = await storageClient.uploadAsJson(tokenListData, { acl });
      localStorage.setItem(this.TOKEN_LIST_KEY, uri);

      console.log('Token updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating token:', error);
      return false;
    }
  }

  // 根据合约地址获取单个代币
  static async getTokenByContract(contractAddress: string): Promise<TokenData | null> {
    try {
      const tokenList = await this.getTokenList();
      return tokenList.tokens.find(
        token => token.contractAddress.toLowerCase() === contractAddress.toLowerCase()
      ) || null;
    } catch (error) {
      console.error('Error getting token by contract:', error);
      return null;
    }
  }

  // 清除本地索引（用于测试或重置）
  static clearLocalIndex(): void {
    localStorage.removeItem(this.TOKEN_LIST_KEY);
  }
}

// Hook for React components
export function useLensGroveTokenStorage() {
  const saveTokenToList = async (tokenData: TokenData, walletAddress: string) => {
    return await LensGroveTokenManager.saveTokenToList(tokenData, walletAddress);
  };

  const getTokenList = async () => {
    return await LensGroveTokenManager.getTokenList();
  };

  const getAllTokens = async () => {
    return await LensGroveTokenManager.getAllTokens();
  };

  const getTokensByCreator = async (creatorAddress: string) => {
    return await LensGroveTokenManager.getTokensByCreator(creatorAddress);
  };

  const getMetadataUris = async () => {
    return await LensGroveTokenManager.getMetadataUris();
  };

  const deleteToken = async (contractAddress: string, adminAddress: string) => {
    return await LensGroveTokenManager.deleteToken(contractAddress, adminAddress);
  };

  const updateToken = async (updatedToken: TokenData, adminAddress: string) => {
    return await LensGroveTokenManager.updateToken(updatedToken, adminAddress);
  };

  const getTokenByContract = async (contractAddress: string) => {
    return await LensGroveTokenManager.getTokenByContract(contractAddress);
  };

  return {
    saveTokenToList,
    getTokenList,
    getAllTokens,
    getTokensByCreator,
    getMetadataUris,
    deleteToken,
    updateToken,
    getTokenByContract
  };
}