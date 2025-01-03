'use client';

import React, { useState } from 'react';
import { useAccount, useDeployContract, useSignMessage } from 'wagmi';
import { deployContract, estimateGas } from '@wagmi/core'
import { bytecode, memeAbi } from './meme';
import { config } from '@/config/Provider';

import { storageClient } from '@/lib/StorageNode';
import { LensSVG } from '@/gui/LensSVG';
import { FaSquareXTwitter, FaTelegram } from 'react-icons/fa6';
import { RiGlobalLine } from 'react-icons/ri';

interface Signer {
    signMessage({ message }): Promise<string>;
  }
export default function MemeLauncher() {
    const { address } = useAccount({ config });
  
    const { data: wagmiSigner } = useSignMessage({ config });
    const signer = wagmiSigner as unknown as Signer;

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

    const [logoUrlDisplay, setLogoUrlDisplay] = useState<string | null>(null);
    const [metadataUrlDisplay, setMetadataUrlDisplay] = useState<string | null>(null);
    const [transactionHash, setTransactionHash] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const [errors, setErrors] = useState({
        name: false,
        symbol: false,
        initialSupply: false,
        bio: false,
        logo: false,
    });

    const validateInputs = () => {
        const newErrors = {
            name: !name.trim(),
            symbol: !symbol.trim(),
            initialSupply: initialSupply <= 0,
            bio: !bio.trim(),
            logo: !preview, // 以用户是否上传 logo 文件为依据
        };
        setErrors(newErrors);

        // 返回是否通过验证
        return !Object.values(newErrors).some((error) => error);
    };

    //上传logo后显示
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string); // 将结果保存到预览状态
            };
            reader.readAsDataURL(file); // 将文件读取为 Data URL
        }
    };

    const handleLaunch = async () => {
        if (!validateInputs()) {
            alert('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        let uploadedLogoUrl = logoUrl; // 记录上传的 Logo URL

        try {
            // 如果有选择 Logo 文件，则上传
            const logoInput = document.querySelector<HTMLInputElement>('input[name="logo"]');
            if (logoInput?.files && logoInput.files[0]) {
                const file = logoInput.files[0];
                const { uri } = await storageClient.uploadFile(file);
                uploadedLogoUrl = await storageClient.resolve(uri);
                setLogoUrlDisplay(uploadedLogoUrl); // 更新展示用的 logo URL
            }

            // 准备 Metadata JSON 数据
            const jsonData = {
                name,
                symbol,
                initialSupply,
                bio,
                logo: uploadedLogoUrl,
                webSite,
                lensSite,
                xSite,
                telegramSite,
            };

            // 上传 Metadata JSON
            const { uri } = await storageClient.uploadAsJson(jsonData);
            const metadataUrl = await storageClient.resolve(uri);
            setMetadataUrlDisplay(metadataUrl); // 更新展示用的 metadata URL

            // 部署 ERC20 合约
            //const { deployContract,data } = useDeployContract({ config })
            const hash = await deployContract(config, {
                abi: memeAbi,
                bytecode: bytecode as `0x${string}`,
                args: [name, symbol, BigInt(initialSupply), metadataUrl],
            })

            // 获取交易哈希
            setTransactionHash(hash);
            alert('Contract deployed successfully!');
        } catch (error) {
            console.error('An error occurred during the process:', error);

            // 删除 logoUrl 和 metadataUrl
            try {
                if (uploadedLogoUrl) {
                    const success = await storageClient.delete(uploadedLogoUrl, signer);
                    if (success) console.log(`Deleted logo URL: ${uploadedLogoUrl}`);
                }

                if (metadataUrlDisplay) {
                    const success = await storageClient.delete(metadataUrlDisplay, signer);
                    if (success) console.log(`Deleted metadata URL: ${metadataUrlDisplay}`);
                }
            } catch (deleteError) {
                console.error('Failed to delete resources:', deleteError);
            }

            alert('An error occurred during the process. Uploaded resources have been deleted.');
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
                        className={`input input-bordered w-full ${errors.name ? 'border-red-500' : ''}`}
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
                        className={`input input-bordered w-full ${errors.symbol ? 'border-red-500' : ''}`}
                    />
                </div>

                <div>
                    <label className="block mb-1 font-semibold">Initial Supply</label>
                    <input
                        type="number"
                        name="initialSupply"
                        placeholder="0"
                        min={1}
                        value={initialSupply}
                        onChange={(e) => setInitialSupply(Number(e.target.value))}
                        className={`input input-bordered w-full ${errors.initialSupply ? 'border-red-500' : ''}`}
                    />
                </div>

                <div>
                    <label className="block mb-1 font-semibold">Bio</label>
                    <textarea
                        name="bio"
                        placeholder="Input Bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className={`textarea textarea-bordered w-full h-24 ${errors.bio ? 'border-red-500' : ''}`}
                    />
                </div>

                <div>
                    <label className="block mb-1 font-semibold">Logo</label>
                    {preview && (<img src={preview} alt="Preview" className="w-32 h-32 object-cover border rounded-md" />)}
                    <input
                        type="file"
                        name="logo"
                        className={`file-input file-input-bordered w-full mt-2 ${errors.logo ? 'border-red-500' : ''}`}
                        onChange={handleFileChange}
                    />
                </div>

                {/* Media links (optional) */}
                <div className="flex-col flex gap-2 my-4">
                    <h2 className="text-xl font-semibold">Media Links (Optional)</h2>

                    <label className="input input-bordered flex items-center gap-2">
                        <RiGlobalLine className="w-6 h-6" />
                        <input
                            type="text"
                            className="grow"
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
                            className="grow"
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
                            className="grow"
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
                            className="grow"
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

            </div>
            <div className="mt-6">
                {logoUrlDisplay && (
                    <div className="text-center">
                        <p>Logo successfully uploaded! View your logo:</p>
                        <a href={logoUrlDisplay} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                            {logoUrlDisplay}
                        </a>
                    </div>
                )}

                {metadataUrlDisplay && (
                    <div className="text-center mt-4">
                        <p>Metadata JSON successfully uploaded! View your data:</p>
                        <a href={metadataUrlDisplay} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                            {metadataUrlDisplay}
                        </a>
                    </div>
                )}

                {transactionHash && (
                    <div className="text-center mt-6">
                        <p>Contract successfully deployed! View your contract transaction:</p>
                        <a href={`https://block-explorer.testnet.lens.dev/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                            {transactionHash}
                        </a>
                    </div>
                )}
            </div>

        </div>
    );
}
