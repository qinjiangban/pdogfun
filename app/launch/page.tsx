'use client';

import { config } from '@/config/Provider';
import { useState } from 'react';
import { FaSquareXTwitter, FaTelegram } from 'react-icons/fa6';
import { RiGlobalLine } from 'react-icons/ri';
import { useAccount } from 'wagmi';

export default function MemeLauncher() {
    const { address } = useAccount({ config });

    return (
        <div className="min-h-[calc(100vh-64px)] p-2 md:p-6 mb-12 font-sans bg-base-200 ">
            <h1 className="text-3xl font-bold text-center mb-6">🚀 Meme Launch 🚀</h1>


            <div className="max-w-3xl mx-auto bg-base-100 p-4 md:p-6 rounded-3xl shadow-md border flex flex-col gap-4">

                <div className="">
                    <label className="block mb-1 font-semibold">Logo</label>
                    <input type="file" name="logo" className="file-input file-input-bordered w-full" />
                </div>

                <div className="">
                    <label className="block mb-1 font-semibold ">Title</label>
                    <input
                        type="text"
                        placeholder="Input Title"
                        className="input input-bordered w-full"
                    />
                </div>

                <div className="">
                    <label className="block mb-1 font-semibold">Symbol</label>
                    <input
                        type="text"
                        placeholder="Input Symbol"
                        className="input input-bordered w-full"
                    />
                </div>

                <div className="">
                    <label className="block mb-1 font-semibold">Bio</label>
                    <textarea
                        placeholder="Input Bio"
                        className="textarea textarea-bordered w-full h-24"
                    />
                </div>



                <div className='flex-col flex gap-2 my-4'>
                    <h2 className="text-xl font-semibold">More options</h2>

                    <label className="input input-bordered flex items-center gap-2">
                        <RiGlobalLine className="w-6 h-6 " />
                        <input type="text" className="grow" placeholder="Web Site" />
                    </label>

                    <label className="input input-bordered flex items-center gap-2">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6  duration-300 shrink-0" ><path fill-rule="evenodd" clip-rule="evenodd" d="M16.2286 8.68583C17.1304 7.92987 18.1364 7.64225 19.1013 7.71497C20.1305 7.79253 21.0829 8.27728 21.7943 8.98137C22.5055 9.68551 22.9942 10.6273 23.0725 11.6438C23.1514 12.6695 22.8096 13.7438 21.9085 14.6866C21.8261 14.7734 21.7419 14.8591 21.6558 14.9437C17.5684 18.9893 12.1391 19 12.0835 19H12.0833C12.0555 19 6.60887 18.9998 2.51095 14.9433L2.51006 14.9423C2.42546 14.8581 2.34215 14.7732 2.26008 14.688L2.25943 14.6872C1.35786 13.7452 1.01574 12.6712 1.09442 11.6455C1.17238 10.6292 1.66073 9.68726 2.37184 8.98288C3.08289 8.27853 4.03523 7.79339 5.06463 7.71551C6.02943 7.6425 7.03571 7.92977 7.93793 8.68536C8.03495 7.51996 8.54038 6.61294 9.27407 5.98939C10.0566 5.32433 11.0763 5 12.0833 5C13.0903 5 14.11 5.32433 14.8924 5.98939C15.6262 6.61303 16.1317 7.52021 16.2286 8.68583ZM12.2704 18.5899L12.2702 18.5847H12.2705L12.2704 18.5899ZM11.8962 18.5899L11.896 18.5847H11.8964L11.8962 18.5899ZM15.1541 12.9723C15.0422 12.9723 15.0035 13.1321 15.0748 13.2168C15.201 13.3668 15.277 13.5598 15.277 13.7703C15.277 14.248 14.8859 14.6353 14.4033 14.6353C13.9207 14.6353 13.5294 14.248 13.5294 13.7703C13.5294 13.7448 13.4958 13.732 13.4805 13.7528C13.3427 13.9401 13.2497 14.1505 13.2114 14.3714C13.1899 14.4957 13.0878 14.5989 12.9595 14.5989H12.8886C12.7211 14.5989 12.5829 14.4644 12.6077 14.3015C12.7771 13.1854 13.8883 12.3759 15.1541 12.3759C16.4198 12.3759 17.5309 13.1854 17.7004 14.3015C17.725 14.4644 17.5869 14.5989 17.4195 14.5989C17.2519 14.5989 17.1193 14.4637 17.0828 14.3029C16.9173 13.5714 16.1493 12.9723 15.1541 12.9723ZM7.39443 13.7703C7.39443 13.7366 7.35029 13.7185 7.32951 13.7453C7.18219 13.9356 7.08181 14.1511 7.03931 14.3783C7.01423 14.5124 6.90397 14.624 6.76521 14.624H6.71321C6.54572 14.624 6.40756 14.4895 6.43225 14.3267C6.60162 13.21 7.71295 12.4011 8.97862 12.4011C10.2443 12.4011 11.3556 13.21 11.525 14.3267C11.5497 14.4895 11.4115 14.624 11.244 14.624C11.0765 14.624 10.9439 14.4889 10.9075 14.3281C10.742 13.5961 9.97402 12.9974 8.97862 12.9974C8.88814 12.9974 8.85503 13.1232 8.9156 13.1893C9.05632 13.3428 9.14207 13.5467 9.14207 13.7703C9.14207 14.248 8.75085 14.6353 8.26825 14.6353C7.78565 14.6353 7.39443 14.248 7.39443 13.7703ZM13.0554 15.8564C13.1737 15.7399 13.3567 15.6832 13.5036 15.7621C13.6506 15.8411 13.7064 16.0244 13.6005 16.152C13.2555 16.5673 12.697 16.8306 12.0809 16.8306C11.4652 16.8306 10.9055 16.5702 10.5601 16.1516C10.4545 16.0238 10.511 15.8405 10.6582 15.7621C10.8055 15.6836 10.9881 15.7411 11.1063 15.8576C11.334 16.0824 11.6796 16.2344 12.0809 16.2344C12.4813 16.2344 12.8272 16.0808 13.0554 15.8564Z"></path></svg>
                        <input type="text" className="grow" placeholder="lens" />
                    </label>

                    <label className="input input-bordered flex items-center gap-2">
                        <FaSquareXTwitter className="w-6 h-6 " />
                        <input type="text" className="grow" placeholder="X" />
                    </label>

                    <label className="input input-bordered flex items-center gap-2">
                        <FaTelegram className="w-6 h-6 " />
                        <input type="text" className="grow" placeholder="Telegram" />
                    </label>
                </div>



                <div className="">
                    <label className="block mb-1 font-semibold">Buy at launch? (in ETH)</label>
                    <input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="input input-bordered w-full"
                    />
                </div>

                {address ? (
                    <button className="btn btn-primary w-full text-xl">Launch</button>
                ) : (
                    <p className="text-center text-error mt-10">
                        Please connect your wallet to use the Meme Launcher feature.
                    </p>
                )}

            </div>

        </div>
    );
}