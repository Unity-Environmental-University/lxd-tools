import {CanvasData} from "@/canvas/canvasDataDefs";
import requireActual = jest.requireActual;
import {mockAsyncGenerator} from "@/__mocks__/utils";

const actual = requireActual('../getPagedDataGenerator');
export const getPagedDataGenerator = jest.fn(() => mockAsyncGenerator([]));
export const getPagedData = jest.fn();
export const mergePagedDataGenerators = jest.fn(actual.mergedPagedDataGenerators)
