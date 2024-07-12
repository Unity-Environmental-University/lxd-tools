export function sleep(milliseconds: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, milliseconds)
    })
}

export function isNotNullOrUndefined(value:any) {
    if(value === null) return false;
    if (typeof value === 'undefined') return false;
    return true;
}