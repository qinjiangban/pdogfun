'use client'

import { ChainIcon, ConnectKitButton, useModal } from "connectkit";
import makeBlockie from "ethereum-blockies-base64";

export default function ConnectButton() {
    const { openSwitchNetworks } = useModal()
    return (
        <>
            {/*             <ConnectKitButton.Custom>
                {({ chain }) => {
                    return (
                        <button onClick={() => openSwitchNetworks()} className=" btn btn-primary">
                            <ChainIcon id={chain?.id} /> {chain?.name}
                        </button>
                    );
                }}
            </ConnectKitButton.Custom> */}
            <ConnectKitButton.Custom>
                {({ isConnected, isConnecting, show, hide, address, truncatedAddress, ensName, chain }) => {
                    return (
                        <>
                            {isConnected ?
                                <>
                                    <button onClick={show} className=" flex lg:hidden btn btn-ghost btn-circle  bg-zinc-400/20">
                                        {address && <img src={makeBlockie(address as `0x${string}`)} className="w-9 h-9 rounded-full " />}
                                    </button>
                                    <button onClick={show} className=" hidden lg:flex btn btn-ghost bg-zinc-400/20">
                                        {address && <img src={makeBlockie(address as `0x${string}`)} className="w-9 h-9 rounded-full " />}
                                        <span className=" hidden lg:block"> {ensName ?? truncatedAddress}</span>
                                    </button>
                                </>
                                :
                                <button onClick={show} className="btn btn-primary ">
                                    {isConnecting ? <span className="loading loading-spinner"></span> : 'Connect'}
                                </button>
                            }

                        </>
                    );
                }}
            </ConnectKitButton.Custom>
        </>
    )
}