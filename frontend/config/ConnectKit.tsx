'use client'
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { useTheme } from "next-themes";
import { Types } from "connectkit";
import makeBlockie from "ethereum-blockies-base64";

export default function ConnectKit({ children }) {
    const { theme } = useTheme();

    return (
        <ConnectKitProvider
            options={{
                //language: "en-US",
                customAvatar: MyCustomAvatar,
            }}
            mode={theme === 'dark' ? 'dark' : 'light'}
            customTheme={{
                "--ck-accent-color": "#C0E218",
                "--ck-body-color-muted-hover": "#C0E218",
                "--ck-connectbutton-hover-background": "#C0E218",

                "--ck-primary-button-hover-color": "#000000",
                "--ck-primary-button-hover-background": "#C0E218",

                //"--ck-secondary-button-color": "#C0E218",
                "--ck-secondary-button-box-shadow": "0 0 0 1px #000",
                //"--ck-secondary-button-hover-color": "#C0E218",
                //"--ck-secondary-button-hover-backgroundd": "#C0E218",
                "--ck-secondary-button-hover-box-shadow": "#C0E218",

                "--ck-tertiary-button-color": "#C0E218",
                //"--ck-tertiary-button-box-shadow": "0 0 0 1px #000",
                //"--ck-tertiary-button-hover-background": "#C0E218",

                "--ck-primary-button-border-radius": "999",
                "--ck-border-radius": 42,
            }}
        >
            {children}
        </ConnectKitProvider>
    )
}

const MyCustomAvatar = ({ address, ensImage, ensName, size, radius }: Types.CustomAvatarProps) => {
    return (
        <div
            style={{
                overflow: "hidden",
                borderRadius: radius,
                height: size,
                width: size,
                
            }}
        >
            {ensImage ? <img src={ensImage} alt={ensName ?? address} width="100%" height="100%" />:<img src={makeBlockie(address as `0x${string}`)} className="w-full h-full rounded-full" />}
        </div>
    );
};
