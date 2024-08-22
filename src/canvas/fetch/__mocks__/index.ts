const actual = jest.requireActual('../utils');

export const overrideConfig = jest.fn(actual.overrideConfig)
export const canvasDataFetchGenFunc = jest.fn(actual.canvasDataFetchGenFunc);

export const fetchGetConfig = jest.fn(actual.fetchGetConfig)
