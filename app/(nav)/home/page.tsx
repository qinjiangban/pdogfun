'use client'
import { useEffect, useState } from "react";
import Link from "next/link";

<div className="flex w-52 flex-col gap-4">
    <div className="flex items-center gap-4">
        <div className="skeleton h-16 w-16 shrink-0 rounded-full"></div>
        <div className="flex flex-col gap-4">
            <div className="skeleton h-4 w-20"></div>
            <div className="skeleton h-4 w-28"></div>
        </div>
    </div>
    <div className="skeleton h-32 w-full"></div>
</div>

export default function Page() {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true); // 用于表示加载状态
    const [currentPage, setCurrentPage] = useState(1);

    const lens_storage_key = [
        '611d657a1b8c4921e052516e8f8530264379ec3e25ea4290b7a165c3dc76caac',
        '9194f5df569c8939c6874cfe28a7272688fb85c5043aaef336040e9fec33c00c',
        '6012d9c3f99d0ef2c47d1712f14709aac0a2fd8f3af66d13e37ace2c5c81b393',
        '7d04f9c3e545d210a10a4fea253f655566dd704847f073eb1fd317f90d803f9e',
        'a48c4e7576a1a43f3eae9ceff82bec0d9fbdf1f32dfaaf71279ddfaafacb7e63',
        '6ded1fd3ed3334aa28d5d0663578c4d1666c279410a5728033380a6118c12d63',
        '6ded1fd3ed3334aa28d5d0663578c4d1666c279410a5728033380a6118c12d63',
        '6ded1fd3ed3334aa28d5d0663578c4d1666c279410a5728033380a6118c12d63',
        '6ded1fd3ed3334aa28d5d0663578c4d1666c279410a5728033380a6118c12d63',
        '6ded1fd3ed3334aa28d5d0663578c4d1666c279410a5728033380a6118c12d63',
        '6ded1fd3ed3334aa28d5d0663578c4d1666c279410a5728033380a6118c12d63',
        '6ded1fd3ed3334aa28d5d0663578c4d1666c279410a5728033380a6118c12d63',
        '6ded1fd3ed3334aa28d5d0663578c4d1666c279410a5728033380a6118c12d63',
        '6ded1fd3ed3334aa28d5d0663578c4d1666c279410a5728033380a6118c12d63',
        '6ded1fd3ed3334aa28d5d0663578c4d1666c279410a5728033380a6118c12d63',
        '6ded1fd3ed3334aa28d5d0663578c4d1666c279410a5728033380a6118c12d63',
        '6ded1fd3ed3334aa28d5d0663578c4d1666c279410a5728033380a6118c12d63',


    ];


    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        async function fetchData() {
            try {
                const responses = await Promise.all(
                    lens_storage_key.map((key) =>
                        fetch(`https://storage-api.testnet.lens.dev/${key}`).then((res) => {
                            if (!res.ok) {
                                throw new Error(`HTTP error! status: ${res.status}`);
                            }
                            return res.json();
                        })
                    )
                );
                setData(responses);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    const PAGE_SIZE = 15;
    const totalPages = Math.ceil(lens_storage_key.length / PAGE_SIZE);
    const paginatedData = data.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    return (
        <div className="min-h-[calc(100vh-64px)] p-2 md:p-4">
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
                    : paginatedData.map((token, key) => (
                        <Link
                            href={`/token/${lens_storage_key[key]}`}
                            className="flex flex-col xs:flex-row bg-base-100 rounded-2xl shadow-md max-h-64 min-h-32 w-full hover:bg-[var(--button-bg)]"
                            key={token.key}
                        >
                            <figure className="p-2 min-h-32 flex items-center justify-center">
                                <img
                                    src={token.logo}
                                    alt={token.symbol}
                                    className="bg-black min-w-24 max-w-32 max-h-32 rounded-2xl"
                                />
                            </figure>
                            <div className="p-2">
                                <h2>
                                    {token.symbol}{" "}
                                    <span className="text-sm text-base-content/60">{token.name}</span>
                                </h2>
                                <p className="line-clamp-2 text-ellipsis overflow-hidden">
                                    {token.bio}
                                </p>
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
