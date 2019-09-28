export function toIsoDate(date: Date): string {
    if (date === undefined || date === null) {
        return null;
    }
    if (!(date instanceof Date)) {
        throw Error("Expected Date");
    }
    const y = (date.getFullYear() + '').padStart(4, '0');
    const m = ((date.getMonth() + 1) + '').padStart(2, '0');
    const d = (date.getDate() + '').padStart(2, '0');
    return y + '-' + m + '-' + d;
}


export function fromIsoDate(date: string): Date {
    if (date === undefined || date === null) {
        return null;
    }
    if (!(typeof date === 'string')) {
        throw Error("Expected string");
    }
    const ymd = date.split('-');
    if (ymd.length !== 3) {
        throw Error("Invalid format");
    }
    return new Date(parseInt(ymd[0]), parseInt(ymd[1]) - 1, parseInt(ymd[2]), 0, 0, 0, 0);
}

