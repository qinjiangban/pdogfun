'use client'

export default function PositionRanking() {
    return (
        <div className="">
            <div className="w-full md:max-w-md bg-base-100 shadow-lg rounded-2xl p-6">


                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">Position Ranking</h1>
                </div>


                <div className="overflow-x-auto">
                    <table className="table table-xs table-pin-rows table-pin-cols">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Proportion</th>
                                <th>quantity</th>
                                <th>Value</th>
                                <th>Address</th>
                            </tr>
                        </thead>
                        <tbody className=" overflow-y-auto">
                            <tr className="hover:bg-[var(--button-bg)]">
                                <th>1</th>
                                <td>50%</td>
                                <td>88.69M</td>
                                <td>$ 5.8B</td>
                                <td>0x8A...090</td>
                            </tr>
                            <tr className="hover:bg-[var(--button-bg)]">
                                <th>2</th>
                                <td>30%</td>
                                <td>58.22K</td>
                                <td>$ 78.9M</td>
                                <td>0x2d...3ca</td>
                            </tr>
                            <tr className="hover:bg-[var(--button-bg)]">
                                <th>3</th>
                                <td>10%</td>
                                <td>8.6K</td>
                                <td>$ 9.97k</td>
                                <td>0x59...ADC</td>
                            </tr>
                        </tbody>
                    </table>
                </div>


            </div>
        </div>
    )
}