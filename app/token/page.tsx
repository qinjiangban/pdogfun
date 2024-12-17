'use client'

import TradingViewWidget from "./TradingViewWidget"

export default function page() {
  return (
    <div className=" min-h-[calc(100vh-64px)]">
      <TradingViewWidget />
    </div>
  )
}