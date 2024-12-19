import { RiExchange2Line } from "react-icons/ri";
import { CgArrowsExchangeAltV } from "react-icons/cg";

export default function UniswapStyleComponent() {
    return (
        <div className="">
            <div className="w-full md:max-w-md bg-base-100 shadow-lg rounded-2xl p-6">

                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">Swap</h1>
                    <button className="btn btn-sm btn-outline">Settings</button>
                </div>

                <div className="mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="0.0"
                            className="input input-bordered w-full pr-20 text-xl font-medium"
                        />
                        <button className="absolute top-0 right-0 w-16 h-full px-4  rounded-r-full font-semibold text-sm text-black bg-primary">
                            ETH
                        </button>
                    </div>
                </div>

                <div className="flex justify-center items-center mb-4">
                    <button className="btn  btn-circle">
                        <CgArrowsExchangeAltV className="w-8 h-8" />
                    </button>
                </div>

                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="0.0"
                            className="input input-bordered w-full pr-20 text-xl font-medium"
                        />
                        <button className="absolute top-0 right-0 w-16 h-full px-4  rounded-r-full font-semibold text-sm text-black  bg-primary">
                            USDC
                        </button>
                    </div>
                </div>

                {/* Price Info */}
                <div className="mb-6 text-sm text-gray-500">
                    <div className="flex justify-between mb-1">
                        <span>Exchange Rate</span>
                        <span>1 ETH = 2,000 USDC</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Network Fee</span>
                        <span>0.005 ETH</span>
                    </div>
                </div>

                {/* Swap Button */}
                <button className="btn btn-primary w-full text-lg font-semibold">
                    Swap
                </button>
            </div>
        </div>
    );
}
