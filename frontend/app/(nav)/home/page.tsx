'use client'
import { useEffect, useState } from "react";
import Link from "next/link";
import { LensGroveTokenManager, TokenData } from '@/lib/tokenStorage';

export default function Page() {
    const [tokens, setTokens] = useState<TokenData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // 现有的硬编码数据作为默认数据
    const existing_lens_storage_keys = [
        '08158b51bfa2e165a000fe26cd723a49dafa4553cced69f0f7330ea6a55c900d',
    ];


    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // 获取所有代币数据
    const loadTokens = async () => {
        try {
            const allTokens = await LensGroveTokenManager.getAllTokens();
            
            // 如果Lens Grove中没有数据，尝试从现有的存储键获取数据
            if (allTokens.length === 0) {
                const fallbackData = await Promise.all(
                    existing_lens_storage_keys.map(async (key) => {
                        try {
                            const response = await fetch(`https://api.grove.storage/${key}`);
                            if (response.ok) {
                                const data = await response.json();
                                return {
                                    contractAddress: 'unknown',
                                    name: data.name || 'Unknown',
                                    symbol: data.symbol || 'UNK',
                                    initialSupply: data.initialSupply || 0,
                                    bio: data.bio || '',
                                    logo: data.logo || '',
                                    webSite: data.webSite || '',
                                    lensSite: data.lensSite || '',
                                    xSite: data.xSite || '',
                                    telegramSite: data.telegramSite || '',
                                    metadataUri: key,
                                    transactionHash: '',
                                    createdAt: new Date().toISOString(),
                                    creator: 'unknown'
                                } as TokenData;
                            }
                            return null;
                        } catch (error) {
                            console.error(`Error fetching fallback data for ${key}:`, error);
                            return null;
                        }
                    })
                );
                const validFallbackData = fallbackData.filter(token => token !== null) as TokenData[];
                setTokens(validFallbackData);
            } else {
                setTokens(allTokens);
            }
        } catch (error) {
            console.error('Error loading tokens:', error);
            setTokens([]);
        }
    };

    // 刷新数据
    const handleRefresh = async () => {
        setIsRefreshing(true);
        setIsLoading(true);
        try {
            await loadTokens();
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsRefreshing(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            await loadTokens();
            setIsLoading(false);
        };

        initializeData();
    }, []);

    const PAGE_SIZE = 15;
    const totalPages = Math.ceil(tokens.length / PAGE_SIZE);
    const paginatedTokens = tokens.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    return (
        <div className="min-h-[calc(100vh-64px)] p-2 md:p-4">
            {/* 刷新按钮 */}
            <div className="flex justify-center mb-4">
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
                        '刷新代币列表'
                    )}
                </button>
            </div>
            <div className="place-items-center grid grid-flow-row grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {isLoading
                    ? Array.from({ length: PAGE_SIZE }).map((_, index) => (
                        <div className="flex flex-col xs:flex-row bg-base-100 rounded-2xl shadow-md max-h-64 min-h-32 w-full items-center gap-4 p-2"  >

                                <div className="skeleton w-32 h-32 shrink-0 "></div>

                                <div className="flex flex-col gap-4 md:w-full">
                                    <div className="flex  gap-2">
                                        <div className="skeleton h-4 w-20"></div>
                                        <div className="skeleton h-4 w-28"></div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="skeleton h-8 md:w-full"></div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="skeleton h-4 w-20"></div>
                                        <div className="skeleton h-4 w-28"></div>
                                    </div>


                            </div>
                        </div>
                    ))
                    : paginatedTokens.map((token, index) => (
                        <Link
                            href={`/token/${token.contractAddress !== 'unknown' ? token.contractAddress : token.metadataUri}`}
                            className="flex flex-col xs:flex-row bg-base-100 rounded-2xl shadow-md max-h-64 min-h-32 w-full hover:bg-[var(--button-bg)]"
                            key={token.contractAddress || token.metadataUri || index}
                        >
                            <figure className="p-2 min-h-32 flex items-center justify-center">
                                <img
                                    src={token.logo || '/placeholder-token.png'}
                                    alt={token.symbol}
                                    className="bg-black min-w-24 max-w-32 max-h-32 rounded-2xl object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder-token.png';
                                    }}
                                />
                            </figure>
                            <div className="p-2 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="font-bold">{token.symbol}</h2>
                                    <span className="text-sm text-base-content/60">{token.name}</span>
                                </div>
                                <p className="line-clamp-2 text-ellipsis overflow-hidden text-sm mb-2">
                                    {token.bio}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-base-content/40">
                                    <span>供应量: {token.initialSupply?.toLocaleString()}</span>
                                    {token.contractAddress !== 'unknown' && (
                                        <span>• {token.contractAddress.slice(0, 6)}...{token.contractAddress.slice(-4)}</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
            </div>

            {/* 分页组件 */}
            <div className="join mt-6 flex justify-center">
                {[...Array(totalPages)].map((_, index) => (
                    <input
                        key={index}
                        type="radio"
                        name="options"
                        className={`join-item btn btn-square ${currentPage === index + 1 ? "btn-primary" : ""
                            }`}
                        defaultChecked={index === 0}
                        aria-label={String(index + 1)}
                        onClick={() => handlePageChange(index + 1)}
                    />
                ))}
            </div>
        </div >
    );
}
