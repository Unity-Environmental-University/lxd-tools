import {ICanvasCallConfig, range} from "../canvasUtils";
import {canvasDataFetchGenFunc, fetchJson, getPagedDataGenerator, renderAsyncGen} from "../fetch";
import {describe, expect} from "@jest/globals";
import {CanvasData} from "../canvasDataDefs";
import {AssertionError} from "node:assert";
import {json} from "node:stream/consumers";


global.fetch = jest.fn();
const fetchMock = fetch as jest.Mock;

describe('renderAsyncGen renders an async generator out', () => {
    const entries = range(0, 20);
    it('render async generator', async () => {
        const asyncGen = async function* () {
            for (let i of [...entries]) {
                yield i;
            }
        }
        const entryIterator = range(0, 20);
        for (let result of await renderAsyncGen(asyncGen())) {
            expect(result).toEqual(entryIterator.next().value)
        }
    })
})

describe('canvasDataFetchGenFunc', () => {
    type Goober = {
        name: string,
        courseId: number,
        gooberId: number,
    } & CanvasData
    const config: ICanvasCallConfig = {fetchInit: {}};
    const goobers: Goober[] = [...range(0, 10)].map(i => ({name: 'thistle', courseId: i, gooberId: i}));


    it('successfully generates urls and results', async () => {
        const fetchGoobersGen = canvasDataFetchGenFunc<Goober, { courseId: number, gooberId: number }>(({
            courseId,
            gooberId
        }) => `/api/v1/${courseId}/${gooberId}`);
        for (let i = 0; i < 10; i++) {
            expect(fetchMock).toBeCalledTimes(i);
            const expectedFetchResult = [goobers[i]];
            fetchMock.mockReturnValue({
                json: async () => expectedFetchResult
            })
            const getGoobers = fetchGoobersGen({courseId: i, gooberId: i * 2}, config);
            const {value} = await getGoobers.next();
            expect(fetchMock).toHaveBeenCalledWith(`/api/v1/${i}/${i * 2}`, config.fetchInit)
            expect(value).toEqual(goobers[i]);
        }
    })
})

describe('fetchJson', () => {
    const testData = {a: 1, b: 2, c: 3};

    it('rejects relative paths', async () => {
        await expect(async () => await fetchJson('apple/dumpling/gang')).rejects.toThrow()
    })
    it('accepts paths starting with /', async () => {
        fetchMock.mockReturnValue({json: async () => testData})
        expect(await fetchJson('/apple/dumpling/gang')).toEqual(testData)
    })
    it('accepts paths starting with http, http, ftp', async () => {
        fetchMock.mockReturnValue({json: async () => testData})
        expect(await fetchJson('http://localhost:8080/apple/dumpling/gang')).toEqual(testData)
        fetchMock.mockReturnValue({json: async () => testData})
        expect(await fetchJson('https://localhost:8080/apple/dumpling/gang')).toEqual(testData)
        fetchMock.mockReturnValue({json: async () => testData})
        expect(await fetchJson('ftp://localhost:8080/apple/dumpling/gang')).toEqual(testData)
    })

    it('incorporatesQueryParams', async () => {
        fetchMock.mockReturnValue({json: async() => testData});
        const fetchInit:RequestInit = { method: 'PUT'};
        await fetchJson('/url', {
            queryParams: {
                query: 'test'
            },
            fetchInit,
        });
        expect(fetchMock).toHaveBeenCalledWith('/url?query=test', fetchInit)

    })
})