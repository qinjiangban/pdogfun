import { LensSVG } from "@/gui/LensSVG";
import { FaSquareXTwitter, FaTelegram } from "react-icons/fa6";
import { HiOutlineCube } from "react-icons/hi";
import { MdDataObject } from "react-icons/md";
import { RiGlobalLine } from "react-icons/ri";

export default async function TokenData({ params }) {

  const response = await fetch(`https://api.grove.storage/${params.contract}`);
  const data = await response.json();


  if (!data) {
    return (
      <div className="flex w-full flex-col gap-4 mt-4">
        <div className="skeleton h-56 w-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 p-4 rounded-2xl shadow-md w-full md:h-auto">
      <div className="mb-4 gap-2 flex flex-row">
        <img
          src={data.logo}
          alt="Logo"
          className="max-w-12 max-h-12 md:max-w-24 md:max-h-24 rounded-full border"
        />
        <div className="flex flex-col md:flex-row gap-2">
          <div>
            <h2>
              <span className="font-bold text-2xl">{data.symbol}</span>{" "}
              <span className="text-sm text-base-content/60">{data.name}</span>
            </h2>
            <p>{data.initialSupply}</p>
            {/* <p className="flex flex-row">{AddressTruncate(params)}</p> */}
          </div>
          <div className="text-sm">{data.bio}</div>
        </div>
      </div>

      <div className="flex flex-row gap-2 grid-rows-3">
        {data.webSite && (
          <a
            href={data.webSite}
            title="Official Website"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm md:btn-md btn-circle"
          >
            <RiGlobalLine className="w-6 h-6" />
          </a>
        )}
        {data.lensSite && (
          <a
            href={data.lensSite}
            title="Follow lens"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm md:btn-md btn-circle"
          >
            <LensSVG />
          </a>
        )}
        {data.xSite && (
          <a
            href={data.xSite}
            title="Follow x"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm md:btn-md btn-circle"
          >
            <FaSquareXTwitter className="w-6 h-6" />
          </a>
        )}
        {data.telegramSite && (
          <a
            href={data.telegramSite}
            title="Join in Telegram"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm md:btn-md btn-circle"
          >
            <FaTelegram className="w-6 h-6" />
          </a>
        )}
        {params.contract && (
          <a
            href={`https://block-explorer.testnet.lens.dev/address/${params.contract}`}
            title="View Token Contract"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm md:btn-md btn-circle"
          >
            <HiOutlineCube className="w-6 h-6" />
          </a>
        )}
        {params.contract && (
          <a
            href={`/lens_storage/${params.contract}`}
            title="View Token Metadata"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm md:btn-md btn-circle"
          >
            <MdDataObject className="w-6 h-6" />
          </a>
        )}
      </div>
    </div>
  );
}
