'use client'
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { LensGroveTokenManager, TokenData, isAdmin, ADMIN_ADDRESS } from '@/lib/tokenStorage';
import { config } from '@/config/Provider';

export default function AdminPage() {
  const { address } = useAccount({ config });
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'symbol'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const PAGE_SIZE = 20;

  // 检查管理员权限
  const isUserAdmin = address ? isAdmin(address) : false;

  // 加载所有代币数据
  const loadTokens = async () => {
    try {
      const allTokens = await LensGroveTokenManager.getAllTokens();
      setTokens(allTokens);
    } catch (error) {
      console.error('Error loading tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新数据
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      await loadTokens();
    } catch (error) {
      console.error('Error refreshing tokens:', error);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  // 删除代币
  const handleDelete = async (contractAddress: string) => {
    if (!address || !isUserAdmin) return;
    
    try {
      const success = await LensGroveTokenManager.deleteToken(contractAddress, address);
      if (success) {
        await loadTokens();
        setDeleteConfirm(null);
        alert('代币删除成功！');
      } else {
        alert('删除失败，请重试。');
      }
    } catch (error) {
      console.error('Error deleting token:', error);
      alert('删除失败：' + error.message);
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  // 过滤和排序代币
  const filteredAndSortedTokens = tokens
    .filter(token => 
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.contractAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.creator.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'symbol':
          aValue = a.symbol.toLowerCase();
          bValue = b.symbol.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const totalPages = Math.ceil(filteredAndSortedTokens.length / PAGE_SIZE);
  const paginatedTokens = filteredAndSortedTokens.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 权限检查
  if (!address) {
    return (
      <div className="min-h-[calc(100vh-64px)] p-2 md:p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">管理员后台</h1>
          <p className="text-base-content/60">请先连接钱包</p>
        </div>
      </div>
    );
  }

  if (!isUserAdmin) {
    return (
      <div className="min-h-[calc(100vh-64px)] p-2 md:p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">访问被拒绝</h1>
          <p className="text-base-content/60">您没有管理员权限</p>
          <p className="text-sm text-base-content/40 mt-2">管理员地址：{ADMIN_ADDRESS}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] p-2 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">代币管理后台</h1>
          <button 
            className="btn btn-primary" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                刷新中...
              </>
            ) : (
              '刷新数据'
            )}
          </button>
        </div>

        {/* 统计信息 */}
        <div className="stats shadow mb-6">
          <div className="stat">
            <div className="stat-title">总代币数</div>
            <div className="stat-value">{tokens.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">搜索结果</div>
            <div className="stat-value">{filteredAndSortedTokens.length}</div>
          </div>
        </div>

        {/* 搜索和排序 */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索代币名称、符号、合约地址或创建者..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="select select-bordered"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="createdAt">按创建时间</option>
              <option value="name">按名称</option>
              <option value="symbol">按符号</option>
            </select>
            <select 
              className="select select-bordered"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
            >
              <option value="desc">降序</option>
              <option value="asc">升序</option>
            </select>
          </div>
        </div>

        {/* 代币列表 */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <div key={index} className="bg-base-100 rounded-lg shadow p-4">
                <div className="flex items-center gap-4">
                  <div className="skeleton w-16 h-16 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-1/4"></div>
                    <div className="skeleton h-4 w-1/2"></div>
                    <div className="skeleton h-4 w-1/3"></div>
                  </div>
                  <div className="skeleton h-8 w-20"></div>
                  <div className="skeleton h-8 w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : paginatedTokens.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">没有找到代币</h2>
            <p className="text-base-content/60">尝试调整搜索条件</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedTokens.map((token, index) => (
              <div key={token.contractAddress} className="bg-base-100 rounded-lg shadow p-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={token.logo} 
                    alt={token.symbol}
                    className="w-16 h-16 rounded-full bg-black object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-token.png';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{token.symbol} - {token.name}</h3>
                    <p className="text-sm text-base-content/60 truncate">{token.bio}</p>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      <span className="badge badge-primary">供应量: {token.initialSupply.toLocaleString()}</span>
                      <span className="badge badge-secondary">{new Date(token.createdAt).toLocaleDateString()}</span>
                      <span className="badge badge-accent">合约: {token.contractAddress.slice(0, 10)}...</span>
                      <span className="badge badge-ghost">创建者: {token.creator.slice(0, 10)}...</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link 
                      href={`/admin/edit/${token.contractAddress}`}
                      className="btn btn-sm btn-outline"
                    >
                      编辑
                    </Link>
                    <button 
                      className="btn btn-sm btn-error"
                      onClick={() => setDeleteConfirm(token.contractAddress)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="join mt-6 flex justify-center">
            {[...Array(totalPages)].map((_, index) => (
              <input
                key={index}
                type="radio"
                name="options"
                className={`join-item btn btn-square ${
                  currentPage === index + 1 ? "btn-primary" : ""
                }`}
                defaultChecked={index === 0}
                aria-label={String(index + 1)}
                onClick={() => handlePageChange(index + 1)}
              />
            ))}
          </div>
        )}

        {/* 删除确认对话框 */}
        {deleteConfirm && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">确认删除</h3>
              <p className="py-4">您确定要删除这个代币吗？此操作不可撤销。</p>
              <div className="modal-action">
                <button 
                  className="btn btn-error"
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  确认删除
                </button>
                <button 
                  className="btn"
                  onClick={() => setDeleteConfirm(null)}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}