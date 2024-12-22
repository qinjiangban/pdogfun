'use client'
import { config } from "@/config/Provider"
import { useAccount } from "wagmi"
import Nav from "./Nav"
import UserData from "./UserData"



export default function layout({ children }) {
    const { address } = useAccount({ config })

    return (
        <div className="min-h-[calc(100vh-64px)] p-2 md:p-4 ">
            {address &&
                <div className="rounded-lg bg-base-100 max-w-3xl mx-auto ">
                    <UserData />
                    <Nav />
                    {children}
                </div>
            }
        </div>
    )
}