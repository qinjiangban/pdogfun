'use client'
import React, { useEffect, useRef, memo } from 'react';


function TradingViewWidget() {
    const container = useRef<HTMLDivElement | null>(null);
    const scriptRef = useRef<HTMLScriptElement | null>(null);
    useEffect(
        () => {
            if (scriptRef.current) return;
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = `
        {
          "autosize": true,
          "symbol": "BINANCE:BTCUSDT",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "hide_side_toolbar": false,
          "allow_symbol_change": true,
          "calendar": false,
          "support_host": "https://www.tradingview.com"
        }`;
            scriptRef.current = script;
            container.current?.appendChild(script);

            return () => {
                // 清理脚本和容器内容
                if (container.current) {
                    container.current.innerHTML = ''; // 清空容器内容
                    scriptRef.current = null; // 重置脚本引用
                }
            };

        }, []);

    return (
        <div className=" min-h-[calc(100vh-64px)]">

            <div className="tradingview-widget-container h-96 w-96" ref={container} >
                <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
                <div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span className="blue-text">Track all markets on TradingView</span></a></div>
            </div>

        </div>
    );
}

export default memo(TradingViewWidget);

