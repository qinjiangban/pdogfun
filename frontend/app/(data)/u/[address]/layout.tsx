'use client'
import { config } from "@/config/Provider"
import { useAccount } from "wagmi"
import Nav from "./UserNav"
import UserData from "./UserData"



export default function layout({ children ,params}) {
    const { address } = useAccount({ config })

    return (
        <div className="min-h-[calc(100vh-64px)] p-2 md:p-4 ">
            {params.address &&
                <div className="rounded-lg bg-base-100 max-w-3xl mx-auto ">
                    <UserData params={params.address}/>
                    <Nav params={params.address}/>
                    {children}
                </div>
            }
        </div>
    )
}