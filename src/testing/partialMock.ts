


export const partiallyMock = <T = typeof import(path)>(path: string, partialMock: Partial<T>) => jest.mock(path, {
    ...jest.requireActual(path),
    ...partialMock,

})

partiallyMock('@canvas', {

})