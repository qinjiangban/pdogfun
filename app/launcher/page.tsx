'use client'

import { config } from '@/config/Provider';
import { useAccount } from 'wagmi';



export default function MemeLauncher() {
    const { address } = useAccount({config}); 


    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }} className='min-h-[calc(100vh-64px)]'>
            <h1>Meme Launcher 🚀</h1>


            {address && (
                <div className=' gap-2'>
                    <input
                        type="text"
                        placeholder="Meme Logo URL"
                        className="input input-bordered w-full m-2"
                    />
                    <textarea
                        placeholder="Meme Bio"
                        className="textarea textarea-bordered w-full h-[20svh] m-2"
                    />
                    <button  className='btn btn-primary'>
                    publish Meme
                    </button>
                </div>
            )}

 
        </div>
    );
}
