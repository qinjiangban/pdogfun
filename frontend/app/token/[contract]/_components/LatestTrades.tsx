'use client'

export default function LatestTrades() {
    return (
        <div className="">
            <div className="w-full md:max-w-md justify-center bg-base-100 shadow-lg rounded-2xl p-6">

                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">Latest Trades</h1>
                </div>

                <div className="overflow-x-auto">
                    <table className="table table-xs table-pin-rows table-pin-cols">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Tokens</th>
                                <th>Price</th>
                                <th>Address</th>
                            </tr>
                        </thead>
                        <tbody className=" overflow-y-auto">
                            <tr className="hover:bg-[var(--button-bg)]">
                                <td>2:00</td>
                                <td>58.6K</td>
                                <td>$0.053950</td>
                                <td>0x8A...090</td>
                            </tr>
                            <tr className="hover:bg-[var(--button-bg)]">
                                <td>3:00</td>
                                <td>98.22K</td>
                                <td>$0.053951</td>
                                <td>0x2d...3ca</td>
                            </tr>
                            <tr className="hover:bg-[var(--button-bg)]">
                                <td>17:00</td>
                                <td>188.6K</td>
                                <td>$0.054345</td>
                                <td>0x59...ADC</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    )
}