import { ParsedQs } from 'qs';

type QueryValue = string | ParsedQs | (string | ParsedQs)[] | undefined;

// Lấy chuỗi từ query param một cách an toàn
export function getQueryString(value: QueryValue): string | undefined {
    if (Array.isArray(value)) {
        const str = value.find((v) => typeof v === 'string');
        return str as string | undefined;
    }

    return typeof value === 'string' ? value : undefined;
}

// Lấy số nguyên từ query param, có fallback mặc định
export function getQueryInt(value: QueryValue, fallback = 1): number {
    const str = getQueryString(value);
    const parsed = parseInt(str ?? '');
    return isNaN(parsed) ? fallback : parsed;
}
