"use client";
import Link from "next/link";
import { usePathname, } from 'next/navigation'
import { RiAddCircleFill, RiAddCircleLine, RiHomeFill, RiHomeLine, RiUserFill, RiUserLine } from "react-icons/ri";


export default function NavFooter() {
    return (
        <div >

            <div className="md:hidden flex fixed bottom-0 w-full h-14 bg-[var(--background-end-rgb)] backdrop-filter backdrop-saturate-180 backdrop-blur-16 border-t z-50 p-1">

                <NavLink
                    href='/home'
                    activeHrefs={['/home']}
                    icon={<RiHomeLine className="size-7" />}
                    activeIcon={<RiHomeFill className="size-7" />}
                    text='Home'
                />

                <NavLink
                    href='/launcher'
                    activeHrefs={['/launcher']}
                    icon={<RiAddCircleLine className="size-7" />}
                    activeIcon={<RiAddCircleFill className="size-7" />}
                    text='Launcher'
                />


                <NavLink
                    href={`/profile`}
                    activeHrefs={[`/profile`]}
                    icon={<RiUserLine className="size-7" />}
                    activeIcon={<RiUserFill className="size-7" />}
                    text='Users'
                />

                {/*        {address ? () : (
          <NavLink
            href={`/profile/sin`}
            activeHrefs={[`/profile/sin`]}
            icon={<RiUserLine className="Navicon" />}
            activeIcon={<RiUserFill className="Navicon" />}
          />
        )}
 */}
            </div>


        </div>
    );
}


function NavLink({ href, activeIcon, icon, activeHrefs, text }) {
    const pathname = usePathname();
    const isActive = activeHrefs.some((activeHref) => pathname.startsWith(activeHref));


    return (
        <Link
            className={`flex-1 flex flex-col items-center justify-center h-full  transition-shadow text-base-content/60  hover:bg-[var(--button-bg)] rounded-full  ${isActive ? '' : ''}`}
            href={href}
            prefetch={true} passHref
        >

            <div className={`flex flex-col items-center justify-center  ${isActive && 'text-base-content'} `}>
                {isActive ? activeIcon : icon}
                {/* <span className="text-xs mt-0.5">{text}</span> */}
            </div>

        </Link>
    );
}
