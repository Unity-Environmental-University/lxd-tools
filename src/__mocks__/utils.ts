export function mockAsyncGenerator<T>(dataSet: T[]) {
    return async function* () {
        for (let value of dataSet) yield value;
    }
}