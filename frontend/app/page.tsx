'use client'

import Link from "next/link";

export default function Home() {

  return (
    <div>


      {/* <Link href={`/storage`} className="btn btn-primary">storage</Link> */}


      <div className="hero bg-base-200 min-h-[calc(100vh-64px)]">

        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">PdogFun</h1>
            <p className="py-6">
              Designed to simplify the creation of meme coins. Allows anyone to quickly and easily launch their own meme token without deep technical knowledge.
            </p>
            <Link href={`/home`} className="btn btn-primary">Get Started</Link>
          </div>
        </div>

      </div>


      <Link href={`/mint`} className="btn btn-primary">mint</Link>
      {/*       <Link href={`/singn`} className="btn btn-primary">singn</Link> 
      <Link href={`/singn/accounts`} className="btn btn-primary">singn/accounts</Link>  */}



    </div>
  );
}