'use client'
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter, useParams } from 'next/navigation';
import { LensGroveTokenManager, TokenData, isAdmin, ADMIN_ADDRESS } from '@/lib/tokenStorage';
import { config } from '@/config/Provider';

export default function EditTokenPage() {
  const { address } = useAccount({ config });
  const router = useRouter();
  const params = useParams();
  const contractAddress = params.contractAddress as string;
  
  const [token, setToken] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<TokenData>>({});

  // 检查管理员权限
  const isUserAdmin = address ? isAdmin(address) : false;

  // 加载代币数据
  const loadToken = async () => {
    try {
      const tokenData = await LensGroveTokenManager.getTokenByContract(contractAddress);
      if (tokenData) {
        setToken(tokenData);
        setFormData(tokenData);
      } else {
        alert('代币不存在');
        router.push('/admin');
      }
    } catch (error) {
      console.error('Error loading token:', error);
      alert('加载代币数据失败');
      router.push('/admin');
    } finally {
      setIsLoading(false);
    }
  };

  // 保存更改
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !isUserAdmin || !token) return;

    setIsSaving(true);
    try {
      const updatedToken: TokenData = {
        ...token,
        ...formData,
        contractAddress: token.contractAddress, // 不允许修改合约地址
        creator: token.creator, // 不允许修改创建者
        createdAt: token.createdAt, // 不允许修改创建时间
      };

      const success = await LensGroveTokenManager.updateToken(updatedToken, address);
      if (success) {
        alert('代币信息更新成功！');
        router.push('/admin');
      } else {
        alert('更新失败，请重试。');
      }
    } catch (error) {
      console.error('Error updating token:', error);
      alert('更新失败：' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 处理表单输入
  const handleInputChange = (field: keyof TokenData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    if (contractAddress) {
      loadToken();
    }
  }, [contractAddress]);

  // 权限检查
  if (!address) {
    return (
      <div className="min-h-[calc(100vh-64px)] p-2 md:p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">编辑代币</h1>
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

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] p-2 md:p-4 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">加载代币数据中...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-64px)] p-2 md:p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">代币不存在</h1>
          <button className="btn btn-primary" onClick={() => router.push('/admin')}>
            返回管理后台
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] p-2 md:p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            className="btn btn-ghost"
            onClick={() => router.push('/admin')}
          >
            ← 返回
          </button>
          <h1 className="text-3xl font-bold">编辑代币信息</h1>
        </div>

        {/* 编辑表单 */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">基本信息</h2>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">代币名称 *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">代币符号 *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.symbol || ''}
                  onChange={(e) => handleInputChange('symbol', e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">初始供应量 *</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={formData.initialSupply || 0}
                  onChange={(e) => handleInputChange('initialSupply', parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">描述</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  value={formData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="代币描述..."
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">LOGO URL</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered"
                  value={formData.logo || ''}
                  onChange={(e) => handleInputChange('logo', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* 社交链接 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">社交链接</h2>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">官网</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered"
                  value={formData.webSite || ''}
                  onChange={(e) => handleInputChange('webSite', e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">X (Twitter)</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered"
                  value={formData.xSite || ''}
                  onChange={(e) => handleInputChange('xSite', e.target.value)}
                  placeholder="https://x.com/..."
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Telegram</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered"
                  value={formData.telegramSite || ''}
                  onChange={(e) => handleInputChange('telegramSite', e.target.value)}
                  placeholder="https://t.me/..."
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Lens</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered"
                  value={formData.lensSite || ''}
                  onChange={(e) => handleInputChange('lensSite', e.target.value)}
                  placeholder="https://hey.xyz/..."
                />
              </div>

              {/* 只读信息 */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium text-base-content/60">只读信息</h3>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">合约地址</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered bg-base-200"
                    value={token.contractAddress}
                    readOnly
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">创建者</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered bg-base-200"
                    value={token.creator}
                    readOnly
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">创建时间</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered bg-base-200"
                    value={new Date(token.createdAt).toLocaleString()}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 预览 */}
          {formData.logo && (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title">预览</h3>
                <div className="flex items-center gap-4">
                  <img 
                    src={formData.logo} 
                    alt={formData.symbol}
                    className="w-16 h-16 rounded-full bg-black object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-token.png';
                    }}
                  />
                  <div>
                    <h4 className="font-bold">{formData.symbol} - {formData.name}</h4>
                    <p className="text-sm text-base-content/60">{formData.bio}</p>
                    <p className="text-xs text-base-content/40">供应量: {formData.initialSupply?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-4 pt-6">
            <button 
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  保存中...
                </>
              ) : (
                '保存更改'
              )}
            </button>
            <button 
              type="button"
              className="btn btn-ghost"
              onClick={() => router.push('/admin')}
              disabled={isSaving}
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}