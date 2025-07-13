

import { LensSVG } from "@/gui/LensSVG";
import { storageClient } from "@/lib/storageClient";
import { } from "@/utils/truncatedAddress";
import Link from "next/link";
import { FaSquareXTwitter, FaTelegram } from "react-icons/fa6";
import { RiGlobalLine } from "react-icons/ri";

export default async function page({ params }) {
  const metadataUrl = storageClient.resolve(`${params.key}`);

  const response = await fetch(`https://api.grove.storage/${params.key}`);


  const data = await response.json();

  return (
    <div className="bg-base-100 p-4 rounded-2xl shadow-md w-full md:h-auto ">

      <div className="max-w-3xl mx-auto  bg-base-100 p-4 md:p-6 rounded-3xl shadow-md border flex flex-col gap-4">
        <article className=" text-wrap ...">
          <p><Link href={metadataUrl} target='_blank' className=" link-hover ">{params.key}↗</Link></p>
        </article>
        <div>
          <label className="block mb-1 font-semibold">Name</label>
          <input
            type="text"
            name="name"
            placeholder="Input Name"
            value={data.name && data.name}
            className="input input-bordered w-full"
            disabled
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Symbol</label>
          <input
            type="text"
            name="symbol"
            placeholder="Input Symbol"
            value={data.symbol && data.symbol}
            className="input input-bordered w-full"
            disabled
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Initial Supply</label>
          <input
            type="number"
            name="initialSupply"
            placeholder="0"
            value={data.initialSupply}
            className="input input-bordered w-full"
            disabled
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Bio</label>
          <textarea
            name="bio"
            placeholder="Input Bio"
            value={data.bio && data.bio}
            className="textarea textarea-bordered w-full h-24"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Logo</label>
          {data.logo &&
            <Link href={data.logo} target='_blank' className="max-w-32 max-h-32 ">
              <img src={data.logo} alt="Logo" className=" max-w-32 max-h-32 rounded-md border hover:border-primary" />
            </Link>
          }
        </div>

        {/* Media links (optional) */}
        <div className="flex-col flex gap-2 my-4">
          <h2 className="text-xl font-semibold">Media Links (Optional)</h2>

          <label className="input input-bordered flex items-center gap-2">
            <RiGlobalLine className="w-6 h-6" />
            <input
              type="text"
              name="webSite"
              placeholder="Web Site"
              value={data.webSite && data.webSite}
            />
          </label>
          <label className="input input-bordered flex items-center gap-2">
            <LensSVG />
            <input
              type="text"
              name="lensSite"
              placeholder="Lens Site"
              value={data.lensSite && data.lensSite}
            />
          </label>
          <label className="input input-bordered flex items-center gap-2">
            <FaSquareXTwitter className="w-6 h-6" />
            <input
              type="text"
              name="xSite"
              placeholder="X Site"
              value={data.xSite && data.xSite}
            />
          </label>

          <label className="input input-bordered flex items-center gap-2">
            <FaTelegram className="w-6 h-6" />
            <input
              type="text"
              name="telegramSite"
              placeholder="Telegram Site"
              value={data.telegramSite && data.telegramSite}
            />
          </label>
        </div>


      </div>
    </div>
  )
}