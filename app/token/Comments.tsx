'use client'

import { RiChat3Line } from "react-icons/ri"

export default function Comments() {
    return (
        <div className="mt-4 bg-base-100 p-4 rounded-2xl shadow-md w-full">

            <h1 className="text-xl font-bold  py-2">Comments</h1>

            <div className="relative">
                <input
                    type="text"
                    placeholder=""
                    className="input input-bordered w-full pr-20 text-xl font-medium"
                />
                <button className="absolute top-0 right-0 w-16 h-full px-4  rounded-r-full font-semibold text-sm text-black bg-primary">
                    <RiChat3Line className="w-6 h-6" />
                </button>
            </div>


            <div className="py-2 text-gray-500">
                This function needs to wait for migration to the lensV3 mainnet. When an account releases tokens, a post with the meme function will be generated. The data comes from the comments of the post.
            </div>

        </div>
    )
}