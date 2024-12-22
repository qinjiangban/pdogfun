"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ConnectButton from "./ConnectButton";
import ThemeSwap from "@/gui/ThemeSwap";
import { RiAddCircleFill, RiAddCircleLine, RiArrowLeftLine, RiHome2Fill, RiHome2Line, RiUserFill, RiUserLine } from "react-icons/ri";
import { HiOutlineMenuAlt1, HiOutlineMenuAlt3 } from "react-icons/hi";
export default function Header() {
    return (
        <>
            <HeaderC />
        </>

    )
}
function HeaderC() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <div className="">



            <div className="navbar w-dvw py-0 px-2 md:px-4  bg-base-100  border-b fixed top-0 left-0 z-50">


                <div className="navbar-start gap-1">
       
                    <Link href={`/`} className="avatar bg-black rounded-full w-12 h-12 hover:border">
                        <Image
                            src='/favicon.ico'
                            width={40}
                            height={40}
                            className="w-12 h-12 rounded-full "
                            alt='Q'
                        />
                    </Link>

                    {pathname && pathname.startsWith('/token') &&
                        <button className="btn btn-square  btn-sm md:btn-md" onClick={() => router.back()} >
                            <RiArrowLeftLine size={24} />
                        </button>
                    }

                </div>


                <div className="navbar-center hidden md:flex">
                    <ul className="menu menu-horizontal gap-x-2 w-auto">
                        <NavbarLink />
                    </ul>
                </div>

                <div className="navbar-end gap-2 px-2">
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn  btn-square md:hidden">
                            <HiOutlineMenuAlt3  className='w-8 h-8' />
                        </div>
                        <ul tabIndex={0}  className="menu menu-lg dropdown-content bg-base-100 rounded-box border shadow z-[1] mt-3 w-52 p-2  gap-2">
                            <NavbarLink />
                        </ul>
                    </div>
                    <ConnectButton />
                </div>

            </div>


            {/*             {["/find", "/message/chat", "/profile"].includes(pathname) ? (
                <div className="sm:hidden flex navbar border-b sm:border-0 w-100vw p-0">
                    {pathname === "/find" && <Find />}
                    {pathname === "/message/chat" && <Message />}
                    {pathname && pathname.startsWith("/profile") && null}
                    {pathname === "/profile" && <Profile />}
                    {pathname === `/@` && <Users />}
                </div>
            ) : null} */}




        </div>)
}

function NavbarLink() {
    const pathname = usePathname();
    const links = [
        {
            title: 'Home',
            href: '/home',
            startsWith: '/home',
            iconActive: RiHome2Fill,
            iconInactive: RiHome2Line,
        },
        {
            title: 'Launch',
            href: '/launch',
            startsWith: '/launch',
            iconActive: RiAddCircleFill,
            iconInactive: RiAddCircleLine,
        },
        {
            title: 'Users',
            href: '/profile',
            startsWith: '/profile',
            iconActive: RiUserFill,
            iconInactive: RiUserLine,
        }
    ];
    return (
        <>
            {links.map(link => (
                <li key={link.href}>
                    <Link
                        href={link.href}
                        className={` btn btn-ghost text-base-content justify-start md:justify-center bg-zinc-400/20  ${pathname && pathname.startsWith(link.startsWith) && "bg-[var(--button-bg)]  "}`}
                    >
                        {pathname && pathname.startsWith(link.startsWith) ? <link.iconActive className="size-8" /> : <link.iconInactive className="size-8" />}
                        <span className=" text-lg">
                            {link.title}
                        </span>
                    </Link>
                </li>
            ))}
            <li><ThemeSwap /></li>

        </>
    )
}
