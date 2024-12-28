
import { config } from "@/config/Provider";
import { client } from "@/lib/client";
import { privateKeyToAccount } from "viem/accounts";
import { useAccount, useSignMessage } from "wagmi";


export default async function page() {
    const { address } = useAccount({ config })
    const { signMessage } = useSignMessage({config})
    const authenticated = await client.login({
        onboardingUser: {
            app: "0xe5439696f4057aF073c0FB2dc6e5e755392922e1",
            wallet: address,
        },
        signMessage: (message) => signMessage({ message }),
    });

    if (authenticated.isErr()) {
        return console.error(authenticated.error);
    }

    // SessionClient: { ... }
    const sessionClient = authenticated.value;
    return (
        <>
            page
        </>
    )
}