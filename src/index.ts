export function sleep(milliseconds: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, milliseconds)
    })
}
