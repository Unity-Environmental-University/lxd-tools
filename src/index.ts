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

export function aMinusBSortFn<T>(func:(value:T) => number) {
    return (a:T, b:T) => func(a) - func(b);
}
export function bMinusASortFn<T>(func:(value:T) => number) {
    return (a:T, b:T) => func(b) - func(a);
}