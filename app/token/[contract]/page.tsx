'use client'

import TokenData from "./_components/TokenData";
import TradingViewWidget from "./_components/TradingViewWidget";
import Swap from "./_components/Swap";
import BondingCurve from "./_components/BondingCurve";
import LatestTrades from "./_components/LatestTrades";
import Comments from "./_components/Comments";
import PositionRanking from "./_components/PositionRanking";

export default function page({ params }) {
  return (
    <div className="min-h-[calc(100vh-64px)] w-full p-2 md:p-4 mb-16">

      <div className="flex flex-col lg:flex-row gap-2 md:gap-4">
        <div className="flex w-auto lg:w-2/3 ... gap-2 md:gap-4 flex-col-reverse md:flex-col">
          <TradingViewWidget props={params.contract} />
          <TokenData params={params} />
        </div>
        <div className=" hidden md:flex flex-1 md:flex-row lg:flex-col w-auto lg:w-md gap-2 md:gap-4 ...">
          <Swap />
          <BondingCurve />
          <LatestTrades />
          <PositionRanking />
        </div>
      </div>
      <div className=" hidden md:block">
        <Comments />
      </div>


      <div className=" mt-4 block md:hidden">
        <div role="tablist" className="tabs  tabs-lg tabs-boxed">
          <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label="Transaction" defaultChecked />
          <div role="tabpanel" className="tab-content w-auto  py-2">
            <div className=" flex flex-col gap-2 md:gap-4">
              <Swap />
              <BondingCurve />
              <LatestTrades />
              <PositionRanking />
            </div>
          </div>

          <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label="Comments" />
          <div role="tabpanel" className="tab-content py-2">
            <Comments />
          </div>

          {/*           <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label="Tab 3" />
          <div role="tabpanel" className="tab-content py-2">Tab content 3</div> */}
        </div>
      </div>



    </div>
  )
}
