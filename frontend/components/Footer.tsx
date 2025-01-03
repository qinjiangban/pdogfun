'use client'

import { LensSVG } from "@/gui/LensSVG";
import Link from "next/link"
import { FaGithub, FaSquareXTwitter, FaTelegram } from 'react-icons/fa6';
import { RiGlobalLine } from "react-icons/ri";
export default function Footer() {
    return (
        <>
            <footer className="footer bg-base-100 text-content items-center p-4 border-t gap-4 sm:grid-flow-col">

                <nav className="grid-flow-col gap-4 sm:place-self-center sm:justify-self-start ">
                    <Link href="https://share.lens.xyz/u/lens/pdogfun" className="hover:text-primary " target='_blank'>
                        <LensSVG />
                    </Link>
                    <Link href="https://github.com/qinjiangban/pdogfun" className="hover:text-primary " target='_blank'>
                        <FaGithub className="w-6 h-6 " />
                    </Link>
                </nav>
                
                <nav className="grid-flow-col gap-4 sm:place-self-center sm:justify-self-center text-gray-400">
                    <p>© {new Date().getFullYear()} pdog.fun</p>
                </nav>
                
                <nav className="grid-flow-col gap-4 sm:place-self-center sm:justify-self-end text-gray-400">
                    <Link href={`/fqa`} className="hover:link "> fqa</Link>
                    <Link href={`/privacy`} className="hover:link "> privacy</Link>
                    <Link href={`/terms`} className="hover:link "> terms</Link>
                </nav>

            </footer>

            <div role="alert" className="alert alert-warning rounded-none">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 shrink-0 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>The website is under construction and is for preview only. The lens test network and this website are for testing purposes only.</span>
            </div>
        </>
    )
}