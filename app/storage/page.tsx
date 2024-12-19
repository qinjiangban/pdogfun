'use client';

import { useEffect, useState } from "react";
import { storageClient } from "@/lib/StorageNode";


export default function Page() {
    const [url, setUrl] = useState<string | null>(null);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const input = event.currentTarget.elements.namedItem("file") as HTMLInputElement;
        if (!input.files || input.files.length === 0) {
            alert("Please select a file before uploading.");
            return;
        }

        try {
            const { uri } = await storageClient.uploadFile(input.files[0]);
            const resolvedUrl = await storageClient.resolve(uri);
            setUrl(resolvedUrl); // 设置 URL 到状态
        } catch (error) {
            console.error("File upload or resolve failed:", error);
            alert("An error occurred. Please try again.");
        }
    }

    return (
        <div className="min-h-[calc(100vh-64px)] p-4">
            <h1 className="text-2xl font-bold mb-4">Upload a File</h1>
            <form id="upload-form" onSubmit={onSubmit} className="flex flex-col gap-4">
                <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                    Select a file:
                </label>
                <input
                    type="file"
                    name="file"
                    accept=""
                    className="file-input file-input-bordered"
                />
                <button type="submit" className="btn btn-primary">
                    Upload
                </button>
            </form>

            {url && (
                <div className="mt-4">
                    <a href={url} target='_blank' className="text-blue-500 break-all">{url}</a>
                    <img src={url} alt="Uploaded File" className="mt-2 max-w-xs rounded-lg shadow-md" />
                </div>
            )}
 
        </div>
    );
}
