const actual = jest.requireActual('../index');

export const overrideConfig = jest.fn(actual.overrideConfig)
export const canvasDataFetchGenFunc = jest.fn(actual.canvasDataFetchGenFunc);
export const renderAsyncGen = jest.fn(actual.renderAsyncGen);

export const fetchGetConfig = jest.fn(actual.fetchGetConfig)

export const generatorMap = jest.fn(actual.generatorMap)