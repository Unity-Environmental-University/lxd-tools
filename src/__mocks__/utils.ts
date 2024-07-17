export function returnMockAsyncGen<T>(dataSet: T[]) {
    return async function* () {
        for (let value of dataSet) yield value;
    }
}

export function mockAsyncGen<T>(dataSet: T[]) {
    return returnMockAsyncGen<T>(dataSet)();
}