'use client'
export function formatNumberWithUnit(number: number | undefined | null): string {
    if (number == null) { // 检查 number 是否为 null 或 undefined
        return '';
    }

    if (number >= 1e9) {
        const formatted = (number / 1e9).toFixed(1);
        return formatted.endsWith('.0') ? `${formatted.slice(0, -2)}B` : `${formatted}B`;
    } else if (number >= 1e6) {
        const formatted = (number / 1e6).toFixed(1);
        return formatted.endsWith('.0') ? `${formatted.slice(0, -2)}M` : `${formatted}M`;
    } else if (number >= 1e3) {
        const formatted = (number / 1e3).toFixed(1);
        return formatted.endsWith('.0') ? `${formatted.slice(0, -2)}K` : `${formatted}K`;
    }
    return number.toString();
}
