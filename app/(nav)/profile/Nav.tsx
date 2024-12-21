'use client'

import Link from "next/link"
import { usePathname } from "next/navigation";
import { RiBardLine, RiUserFollowLine, RiShapesLine, RiFileTextLine, RiImageLine, RiMusic2Line, RiVideoLine } from "react-icons/ri"

export default function Nav() {
    const pathname = usePathname();
    const linknav = [
        {
            href: "/profile",
            name: "Coins held",
        },
        {
            href: "/profile/coins_create",
            name: "Coins create",
        },
        {
            href: "/profile/comment",
            name: "Comment",
        },
        {
            href: "/profile/groups",
            name: "Groups",
        }
    ]
    return (
        <div className=" grid grid-cols-2 xs:grid-cols-4 gap-1 p-1" role="tablist" >
            {linknav.map((item) => (
                <Link href={item.href} className={`btn no-animation ${pathname === item.href ? 'btn-active btn-primary' : ''}`} key={item.href} role="tab">
                    {item.name}
                </Link>
            ))}
        </div>
    )
}