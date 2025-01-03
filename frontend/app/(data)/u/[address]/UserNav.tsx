'use client'

import Link from "next/link"
import { usePathname } from "next/navigation";

export default function Nav({params}) {
    const pathname = usePathname();
    const linknav = [
        {
            href: `/u/${params}`,
            name: "Coins held",
        },
        {
            href: `/u/${params}/coins_create`,
            name: "Coins create",
        },
        {
            href: `/u/${params}/comment`,
            name: "Comment",
        },
        {
            href: `/u/${params}/groups`,
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