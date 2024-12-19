'use client';
import { createChart, ColorType, BusinessDay, Time } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';

type CandlestickData = {
    time: Time;
    open: number;
    high: number;
    low: number;
    close: number;
};

export default function Page({ props }) {
    return (
        <div className="bg-base-100 rounded-2xl shadow-md w-full max-h-[70svh] p-4">
            <ChartComponent {...props} />
        </div>
    );
}

export const ChartComponent = (props) => {
    const {
        colors: {
            backgroundColor = 'black',
            textColor = '#525252FF',
            upColor = '#C0E218',
            downColor = '#ff0000',
            wickUpColor = '#C0E218',
            wickDownColor = '#ff0000',
        } = {},
    } = props;

    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null); // 实时价格状态

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
        });

        const candlestickSeries = chart.addCandlestickSeries({
            upColor,
            downColor,
            wickUpColor,
            wickDownColor,
            borderVisible: false,
        });

        // 初始化历史数据
        const data = generateInitialData(50);
        candlestickSeries.setData(data.initialData);

        // 模拟实时数据更新
        const streamingData = getNextRealtimeUpdate(data.realtimeUpdates);
        const intervalID = setInterval(() => {
            const update = streamingData.next();
            if (update.done) {
                clearInterval(intervalID);
                return;
            }
            candlestickSeries.update(update.value);
            setCurrentPrice(update.value.close); // 更新实时价格
        }, 1000);

        // 自适应宽度
        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(intervalID);
            chart.remove();
        };
    }, [backgroundColor, textColor, upColor, downColor, wickUpColor, wickDownColor]);

    return (
        <div>
            <div ref={chartContainerRef} className='py-2'/>
            <div className="grid md:grid-cols-2 gap-2">
                <div className="border rounded-lg p-3 text-center shadow-md">
                    <h3 className="text-sm">Price</h3>
                    <p className="text-xl font-bold text-green-500">
                        {currentPrice !== null ? `$${currentPrice.toFixed(6)}` : '--'}
                    </p>
                </div>
            </div>
        </div>
    );
};

// 生成初始数据和实时更新数据
function generateInitialData(count: number): { initialData: CandlestickData[]; realtimeUpdates: CandlestickData[] } {
    const initialData: CandlestickData[] = [];
    const realtimeUpdates: CandlestickData[] = [];
    let lastClose = 100;

    for (let i = 0; i < count; i++) {
        const open = lastClose;
        const close = open + (Math.random() - 0.5) * 10;
        const high = Math.max(open, close) + Math.random() * 5;
        const low = Math.min(open, close) - Math.random() * 5;

        initialData.push({
            time: Math.floor(Date.now() / 1000 - (count - i) * 60) as Time,
            open,
            high,
            low,
            close,
        });
        lastClose = close;
    }

    for (let i = 0; i < 100; i++) {
        const open = lastClose;
        const close = open + (Math.random() - 0.5) * 10;
        const high = Math.max(open, close) + Math.random() * 5;
        const low = Math.min(open, close) - Math.random() * 5;

        realtimeUpdates.push({
            time: Math.floor(Date.now() / 1000 + i * 60) as Time,
            open,
            high,
            low,
            close,
        });
        lastClose = close;
    }

    return { initialData, realtimeUpdates };
}

// 模拟实时数据生成器
function* getNextRealtimeUpdate(realtimeData: CandlestickData[]) {
    for (const dataPoint of realtimeData) {
        yield dataPoint;
    }
    return null;
}
