export function returnMockAsyncGen<T>(dataSet: T[]) {
    return async function* () {
        for (const value of dataSet) yield value;
    }
}

export function mockAsyncGen<T>(dataSet: T[]) {
    return returnMockAsyncGen<T>(dataSet)();
}