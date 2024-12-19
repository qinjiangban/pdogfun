'use client';

import React, { useState } from 'react';
import { useAccount, useDeployContract } from 'wagmi';
import { abi, bytecode } from './meme';
import { config } from '@/config/Provider';

import { storageClient } from '@/lib/StorageNode';
import { LensSVG } from '@/gui/LensSVG';
import { FaSquareXTwitter, FaTelegram } from 'react-icons/fa6';
import { RiGlobalLine } from 'react-icons/ri';


export default function MemeLauncher() {
    const { address } = useAccount({ config });

    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [initialSupply, setInitialSupply] = useState(0);
    const [bio, setBio] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [webSite, setWebSite] = useState('');
    const [lensSite, setLensSite] = useState('');
    const [xSite, setXSite] = useState('');
    const [telegramSite, setTelegramSite] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadedData, setUploadedData] = useState<string | null>(null);

    // 上传Logo
    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setLoading(true);
            const file = event.target.files[0];
            try {
                const { uri } = await storageClient.uploadFile(file);
                const resolvedUrl = await storageClient.resolve(uri);
                setLogoUrl(resolvedUrl);
            } catch (error) {
                console.error('Upload failed:', error);
                alert('An error occurred while uploading the logo.');
            } finally {
                setLoading(false);
            }
        }
    };

    // 获取部署合约的钩子
    const { deployContract } = useDeployContract({ config });


    const handleLaunch = async () => {
        setLoading(true);
        const jsonData = {
            name,
            symbol,
            initialSupply,
            bio,
            logo: logoUrl,
            webSite,
            lensSite,
            xSite,
            telegramSite,
        };

        try {
            const { uri } = await storageClient.uploadAsJson(jsonData);
            const resolvedUrl = await storageClient.resolve(uri);
            setUploadedData(resolvedUrl); // Store the uploaded metadata URL
        } catch (error) {
            console.error('Upload failed:', error);
            alert('An error occurred while uploading the data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] p-2 md:p-6 mb-12 font-sans bg-base-200">
            <h1 className="text-3xl font-bold text-center mb-6">🚀 Meme Launch 🚀</h1>
            <div className="max-w-3xl mx-auto bg-base-100 p-4 md:p-6 rounded-3xl shadow-md border flex flex-col gap-4">
            <div>
                    <label className="block mb-1 font-semibold">Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Input Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input input-bordered w-full"
                    />
                </div>

                <div>
                    <label className="block mb-1 font-semibold">Symbol</label>
                    <input
                        type="text"
                        name="symbol"
                        placeholder="Input Symbol"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        className="input input-bordered w-full"
                    />
                </div>

                <div>
                    <label className="block mb-1 font-semibold">Initial Supply</label>
                    <input
                        type="number"
                        name="initialSupply"
                        placeholder="0"
                        value={initialSupply}
                        onChange={(e) => setInitialSupply(Number(e.target.value))}
                        className="input input-bordered w-full"
                    />
                </div>

                <div>
                    <label className="block mb-1 font-semibold">Bio</label>
                    <textarea
                        name="bio"
                        placeholder="Input Bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="textarea textarea-bordered w-full h-24"
                    />
                </div>

                <div>
                    <label className="block mb-1 font-semibold">Logo</label>
                    <input
                        type="file"
                        name="logo"
                        className="file-input file-input-bordered w-full"
                        onChange={handleLogoUpload}
                    />
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
                            value={webSite}
                            onChange={(e) => setWebSite(e.target.value)}
                        />
                    </label>
                    <label className="input input-bordered flex items-center gap-2">
                        <LensSVG />
                        <input
                            type="text"
                            name="lensSite"
                            placeholder="Lens Site"
                            value={lensSite}
                            onChange={(e) => setLensSite(e.target.value)}
                        />
                    </label>
                    <label className="input input-bordered flex items-center gap-2">
                        <FaSquareXTwitter className="w-6 h-6" />
                        <input
                            type="text"
                            name="xSite"
                            placeholder="X Site"
                            value={xSite}
                            onChange={(e) => setXSite(e.target.value)}
                        />
                    </label>

                    <label className="input input-bordered flex items-center gap-2">
                        <FaTelegram className="w-6 h-6" />
                        <input
                            type="text"
                            name="telegramSite"
                            placeholder="Telegram Site"
                            value={telegramSite}
                            onChange={(e) => setTelegramSite(e.target.value)}
                        />
                    </label>
                </div>
                {address ? (
                    <button className={`btn btn-primary w-full text-xl`} onClick={handleLaunch} disabled={loading} >
                        {loading ? <span className="loading loading-spinner "></span> : 'Launch'}
                    </button>
                ) : (
                    <p className="text-center text-error mt-10">
                        Please connect your wallet to use the Meme Launcher feature.
                    </p>
                )}

                {/* Show uploaded metadata URL */}
                {uploadedData && (
                    <div className="mt-6 text-center">
                        <p>Successfully uploaded! View your data:</p>
                        <a href={uploadedData} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                            {uploadedData}
                        </a>
                    </div>
                )}



            </div>
        </div>
    );
}
