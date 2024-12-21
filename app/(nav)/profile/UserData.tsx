'use client'

import { config } from "@/config/Provider"
import { LensSVG } from "@/gui/LensSVG"
import { truncatedAddress } from "@/utils/truncatedAddress"
import makeBlockie from "ethereum-blockies-base64"
import Link from "next/link"
import { useEffect } from "react"
import { FaSquareXTwitter, FaTelegram } from "react-icons/fa6"
import { HiOutlineCube } from "react-icons/hi"
import { MdDataObject } from "react-icons/md"
import { RiGlobalLine } from "react-icons/ri"
import { useAccount, useEnsName } from "wagmi"

export default function UserData() {
    const { address } = useAccount({ config })
    const { data } = useEnsName({ config })



    return (
        <>
            <div className=" p-2 md:p-4 ">

                <div className=" flex flex-row items-center">
                    <div className="btn btn-ghost no-animation" >
                        {address && <img src={makeBlockie(address as `0x${string}`)} className="w-9 h-9 rounded-full " />}
                        <span className=""> {data ?? truncatedAddress(address as `0x${string}`)}</span>
                    </div>
                    <div className="flex-1 " />
                    <div className="btn btn-primary btn-sm">
                        Edit info
                    </div>
                </div>

                <div className="">
                    Bio
                </div>

                <div className="flex flex-row gap-2 grid-rows-3">
                    {address && (
                        <Link
                            href={address}
                            title="Official Website"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm md:btn-md btn-circle"
                        >
                            <RiGlobalLine className="w-6 h-6" />
                        </Link>
                    )}
                    {address && (
                        <Link
                            href={address}
                            title="Follow lens"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm md:btn-md btn-circle"
                        >
                            <LensSVG />
                        </Link>
                    )}
                    {address && (
                        <Link
                            href={address}
                            title="Follow x"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm md:btn-md btn-circle"
                        >
                            <FaSquareXTwitter className="w-6 h-6" />
                        </Link>
                    )}
                    {address && (
                        <Link
                            href={address}
                            title="Join in Telegram"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm md:btn-md btn-circle"
                        >
                            <FaTelegram className="w-6 h-6" />
                        </Link>
                    )}
                    {address && (
                        <Link
                            href={`https://block-explorer.testnet.lens.dev/Linkddress/${address}`}
                            title="View Token Contract"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm md:btn-md btn-circle"
                        >
                            <HiOutlineCube className="w-6 h-6" />
                        </Link>
                    )}

                </div>

            </div>
        </>
    )
}