'use client'
import { formatNumberWithUnit } from "@/utils/formatNumber"


export default function page() {
  return (
    <div className="min-h-[calc(100vh-64px)] p-4 md:p-6">

      <div className="place-items-center grid grid-flow-row grid-cols-1 md:grid-cols-2 xl:grid-cols-3  2xl:grid-cols-4  gap-4">
        {data.map((token) => (
          <>
            <div className="flex flex-row bg-base-100  shadow-md max-h-64 min-h-32 w-full hover:bg-[var(--button-bg)]" key={token.symbol}>

              <figure className="p-2 h-32 flex items-center justify-center">
                <img src={token.logo} alt={token.symbol} className=" bg-black min-w-24 max-w-32  max-h-32" />
              </figure>
              <div className=" p-2">
                <h2 className="">{token.symbol} <span className="text-sm text-base-content/60">{token.title}</span> </h2>
                <p className="line-clamp-2 text-ellipsis overflow-hidden">{token.bio}</p>
                <div className="">
                  <p> <span className="text-sm text-base-content/60">MCAP:</span> ${formatNumberWithUnit(token?.mcap)}</p>
                  <p> <span className="text-sm text-base-content/60">VOLUME:</span> ${formatNumberWithUnit(token?.volume)}</p>
                </div>
              </div>

            </div>

          </>
        ))}
      </div>



    </div>
  )
}
const data = [
  {
    logo: 'https://zksync.io/graphics/hero-mobile.webp',
    title: 'zksync chain',
    symbol: 'ZK',
    bio: 'ZKsync is an ever expanding verifiable blockchain network, secured by math.',
    mcap: '888888888888',
    volume: '99999999'
  },
  {
    logo: '/lens/Icon-T-White_@2x.png',
    title: 'Lens Network',
    symbol: 'LENS',
    bio: 'Lens Network is a high-performance blockchain built to meet the demands of onchain social experiences and Lens V3 is the social features deployed on it.',
    mcap: '800000',
    volume: '300000'
  },
  {
    logo: '/PdogFun.png',
    title: 'PdogFun',
    symbol: 'PDOG',
    bio: 'Designed to simplify the creation of meme coins. Allows anyone to quickly and easily launch their own meme token without deep technical knowledge.',
    mcap: '90909',
    volume: '597999'
  },

]