'use client'
import { LensSVG } from "@/gui/LensSVG";
import { AddressTruncate } from "@/utils/AddressTruncate";
import { useState, useEffect } from "react";
import { FaSquareXTwitter, FaTelegram } from "react-icons/fa6";
import { HiOutlineCube } from "react-icons/hi";
import { RiFileCopyLine, RiGlobalLine } from "react-icons/ri";

export default function TokenData({ params }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('https://storage-api.testnet.lens.dev/6012d9c3f99d0ef2c47d1712f14709aac0a2fd8f3af66d13e37ace2c5c81b393');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err: any) {
        console.error('Error fetching or resolving data:', err);
        setError(err.message || 'Failed to fetch data');
      }
    }

    fetchData();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!data) {
    return <div>
      <div className="flex w-full flex-col gap-4  mt-4">
        <div className="skeleton h-56 w-full"></div>
      </div>
    </div>;
  }

  return (
    <div className="bg-base-100 p-4 rounded-2xl shadow-md w-full md:h-auto ">


      <div className="mb-4 gap-2 flex flex-row">
        <img src={data.logo} alt="Logo" className="max-w-12 max-h-12 md:max-w-24 md:max-h-24 rounded-full border" />
        <div className=" flex flex-col md:flex-row gap-2">
          <div>
            <h2 ><span className="font-bold text-2xl">{data.symbol}</span> <span className="text-sm text-base-content/60">{data.name}</span> </h2>
            <p>{data.initialSupply}</p>
            <p className="flex flex-row">  {AddressTruncate(params)}</p>
          </div>
          <div className="text-sm">{data.bio}</div>
        </div>
      </div>



      <div className=" flex flex-row gap-2 grid-rows-3">
        {data.webSite && (
          <a href={data.webSite} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm md:btn-md btn-circle ">
            <RiGlobalLine className="w-6 h-6" />
          </a>
        )}
        {data.lensSite && (
          <a href={data.lensSite} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm md:btn-md btn-circle ">
            <LensSVG />
          </a>
        )}
        {data.xSite && (
          <a href={data.xSite} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm md:btn-md btn-circle ">
            <FaSquareXTwitter className="w-6 h-6" />
          </a>
        )}
        {data.telegramSite && (
          <a href={data.telegramSite} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm md:btn-md btn-circle ">
            <FaTelegram className="w-6 h-6" />
          </a>
        )}
        {data.xSite && (
          <a href={`https://block-explorer.testnet.lens.dev/address/${params}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm md:btn-md btn-circle">
            <HiOutlineCube className="w-6 h-6" />
          </a>
        )}
      </div>


    </div>
  );
}