import requireActual = jest.requireActual;
import {mockAsyncGen} from "@/__mocks__/utils";

const actual = requireActual('../getPagedDataGenerator');
export const getPagedDataGenerator = jest.fn(() => mockAsyncGen([]));
export const getPagedData = jest.fn();
export const mergePagedDataGenerators = jest.fn(actual.mergedPagedDataGenerators)
