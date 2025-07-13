'use client'
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { LensGroveTokenManager, TokenData } from '@/lib/tokenStorage';
import { config } from '@/config/Provider';
import { FaEdit, FaExternalLinkAlt, FaRefresh } from 'react-icons/fa';
import { RiGlobalLine } from 'react-icons/ri';
import { FaSquareXTwitter, FaTelegram } from 'react-icons/fa6';
import { LensSVG } from '@/gui/LensSVG';

export default function CoinsCreatePage() {
  const { address } = useAccount({ config });
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'symbol' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 加载用户创建的代币
  const loadUserTokens = async () => {
    if (!address) return;
    
    try {
      const userTokens = await LensGroveTokenManager.getTokensByCreator(address);
      setTokens(userTokens);
    } catch (error) {
      console.error('Error loading user tokens:', error);
      setTokens([]);
    }
  };

  // 刷新数据
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      await loadUserTokens();
    } catch (error) {
      console.error('Error refreshing tokens:', error);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  // 过滤和排序代币
  const filteredAndSortedTokens = tokens
    .filter(token => 
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.bio.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'symbol':
          aValue = a.symbol.toLowerCase();
          bValue = b.symbol.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // 分页
  const PAGE_SIZE = 12;
  const totalPages = Math.ceil(filteredAndSortedTokens.length / PAGE_SIZE);
  const paginatedTokens = filteredAndSortedTokens.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const initializeData = async () => {
      await loadUserTokens();
      setIsLoading(false);
    };

    if (address) {
      initializeData();
    } else {
      setIsLoading(false);
    }
  }, [address]);

  // 重置分页当搜索或排序改变时
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  if (!address) {
    return (
      <div className="min-h-[calc(100vh-64px)] p-2 md:p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">我的代币</h1>
          <p className="text-base-content/60 mb-6">请先连接钱包查看您创建的代币</p>
          <Link href="/launch" className="btn btn-primary">
            创建新代币
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] p-2 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">我的代币</h1>
            <p className="text-base-content/60">管理您创建的所有代币</p>
          </div>
          <div className="flex gap-2">
            <button 
              className="btn btn-ghost"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <FaRefresh className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              刷新
            </button>
            <Link href="/launch" className="btn btn-primary">
              创建新代币
            </Link>
          </div>
        </div>

        {/* 搜索和排序 */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索代币名称、符号或描述..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="select select-bordered"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'symbol' | 'createdAt')}
            >
              <option value="createdAt">按创建时间</option>
              <option value="name">按名称</option>
              <option value="symbol">按符号</option>
            </select>
            <select 
              className="select select-bordered"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            >
              <option value="desc">降序</option>
              <option value="asc">升序</option>
            </select>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="stats shadow mb-6">
          <div className="stat">
            <div className="stat-title">总代币数</div>
            <div className="stat-value text-primary">{tokens.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">搜索结果</div>
            <div className="stat-value text-secondary">{filteredAndSortedTokens.length}</div>
          </div>
        </div>

        {/* 代币列表 */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <div key={index} className="card bg-base-100 shadow animate-pulse">
                <div className="card-body">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="skeleton w-16 h-16 rounded-full"></div>
                    <div className="flex-1">
                      <div className="skeleton h-4 w-20 mb-2"></div>
                      <div className="skeleton h-3 w-32"></div>
                    </div>
                  </div>
                  <div className="skeleton h-16 w-full mb-4"></div>
                  <div className="skeleton h-8 w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedTokens.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🪙</div>
            <h3 className="text-xl font-semibold mb-2">
              {tokens.length === 0 ? '还没有创建任何代币' : '没有找到匹配的代币'}
            </h3>
            <p className="text-base-content/60 mb-6">
              {tokens.length === 0 
                ? '开始创建您的第一个代币吧！' 
                : '尝试调整搜索条件或清空搜索框'}
            </p>
            {tokens.length === 0 && (
              <Link href="/launch" className="btn btn-primary">
                创建第一个代币
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedTokens.map((token) => (
                <div key={token.contractAddress} className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
                  <div className="card-body p-4">
                    {/* 代币头部信息 */}
                    <div className="flex items-center gap-3 mb-4">
                      <img 
                        src={token.logo || '/placeholder-token.png'}
                        alt={token.symbol}
                        className="w-16 h-16 rounded-full bg-black object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-token.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{token.symbol}</h3>
                        <p className="text-sm text-base-content/60 truncate">{token.name}</p>
                        <p className="text-xs text-base-content/40">
                          供应量: {token.initialSupply?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* 描述 */}
                    <p className="text-sm text-base-content/80 line-clamp-3 mb-4">
                      {token.bio}
                    </p>

                    {/* 社交链接 */}
                    <div className="flex gap-2 mb-4">
                      {token.webSite && (
                        <a href={token.webSite} target="_blank" rel="noopener noreferrer" 
                           className="btn btn-ghost btn-xs">
                          <RiGlobalLine className="w-3 h-3" />
                        </a>
                      )}
                      {token.lensSite && (
                        <a href={token.lensSite} target="_blank" rel="noopener noreferrer" 
                           className="btn btn-ghost btn-xs">
                          <LensSVG  />
                        </a>
                      )}
                      {token.xSite && (
                        <a href={token.xSite} target="_blank" rel="noopener noreferrer" 
                           className="btn btn-ghost btn-xs">
                          <FaSquareXTwitter className="w-3 h-3" />
                        </a>
                      )}
                      {token.telegramSite && (
                        <a href={token.telegramSite} target="_blank" rel="noopener noreferrer" 
                           className="btn btn-ghost btn-xs">
                          <FaTelegram className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* 合约信息 */}
                    <div className="text-xs text-base-content/40 mb-4">
                      <p>合约: {token.contractAddress.slice(0, 6)}...{token.contractAddress.slice(-4)}</p>
                      <p>创建: {new Date(token.createdAt).toLocaleDateString()}</p>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <Link 
                        href={`/token/${token.contractAddress}`}
                        className="btn btn-primary btn-sm flex-1"
                      >
                        <FaExternalLinkAlt className="w-3 h-3" />
                        查看详情
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="join">
                  {[...Array(totalPages)].map((_, index) => (
                    <input
                      key={index}
                      type="radio"
                      name="options"
                      className={`join-item btn btn-square ${
                        currentPage === index + 1 ? 'btn-primary' : ''
                      }`}
                      defaultChecked={index === 0}
                      aria-label={String(index + 1)}
                      onClick={() => handlePageChange(index + 1)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}