'use client'
import { storageClient } from "@/lib/StorageNode";
import { formatNumberWithUnit } from "@/utils/formatNumber"
import Link from "next/link"
import { useEffect, useState } from "react";


export default function page() {
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 15
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const paginatedData = data.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };




  return (
    <div className="min-h-[calc(100vh-64px)] p-4 md:p-6">

      <div className="place-items-center grid grid-flow-row grid-cols-1 md:grid-cols-2 xl:grid-cols-3  2xl:grid-cols-4  gap-4">
        {paginatedData.map((token) => (
          <Link href={`/token/${token.contract}`} className="flex flex-row bg-base-100 rounded-2xl  shadow-md max-h-64 min-h-32 w-full hover:bg-[var(--button-bg)]" key={token.symbol}>

            <figure className="p-2 min-h-32 flex items-center justify-center">
              <img src={token.logo} alt={token.symbol} className=" bg-black min-w-24 max-w-32  max-h-32 rounded-2xl" />
            </figure>
            <div className=" p-2">
              <h2 className="">{token.symbol} <span className="text-sm text-base-content/60">{token.name}</span> </h2>
              <p className="line-clamp-2 text-ellipsis overflow-hidden">{token.bio}</p>
              <div className="">
                <p> <span className="text-sm text-base-content/60">MCAP:</span> ${formatNumberWithUnit(Number(token?.mcap))}</p>
                <p> <span className="text-sm text-base-content/60">VOLUME:</span>${formatNumberWithUnit(Number(token.volume))}</p>
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
            className={`join-item btn btn-square ${currentPage === index + 1 ? "btn-primary" : ""}`}
            defaultChecked={index === 0}
            aria-label={String(index + 1)}
            onClick={() => handlePageChange(index + 1)}
          />
        ))}
      </div>


    </div>
  )
}
const data = [

  {
    logo: '/lens/Icon-T-White_@2x.png',
    name: 'Lens Network',
    symbol: 'GRASS',
    bio: 'Lens Network is a high-performance blockchain built to meet the demands of onchain social experiences and Lens V3 is the social features deployed on it.',
    contract: '0x000000000000000000000000000000000000800A',
    mcap: '800000',
    volume: '300000'
  },
  {
    logo: '/PdogFun.png',
    name: 'PdogFun',
    symbol: 'PDOG',
    bio: 'Designed to simplify the creation of meme coins. Allows anyone to quickly and easily launch their own meme token without deep technical knowledge.',
    contract: '0x4844bedaD6A261015bb075Df73859091275Bb603',
    mcap: '90909',
    volume: '597999'
  },
]