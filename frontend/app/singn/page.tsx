
import { config } from "@/config/Provider";
import { client } from "@/lib/client";
import { privateKeyToAccount } from "viem/accounts";
import { useAccount, useSignMessage } from "wagmi";


const signer = privateKeyToAccount(process.env.APP_PRIVATE_KEY as `0x${string}`);
export default async function page() {


    return (
        <>
            page
        </>
    )
}