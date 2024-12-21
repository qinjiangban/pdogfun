'use client'
import { RiMoonLine, RiSunLine, RiMoonClearLine } from "react-icons/ri";
import { useTheme } from "next-themes"

export default function ThemeSwap() {
    const { theme, setTheme } = useTheme();
    return (
        <>
            <div onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="btn btn-ghost btn-circle bg-zinc-400/20">
                {theme === 'dark' ? (<RiSunLine size={24} className="" />) : (<RiMoonLine  size={24} className="" />)}
            </div>
        </>
    )
}