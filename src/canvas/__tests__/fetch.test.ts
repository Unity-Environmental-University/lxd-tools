import fetchMock from "jest-fetch-mock";
import {ICanvasCallConfig, range} from "../canvasUtils";
import {canvasDataFetchGenFunc, getPagedDataGenerator, renderAsyncGen} from "../fetch";
import {describe, expect} from "@jest/globals";
import {CanvasData} from "../canvasDataDefs";


global.fetch = jest.fn();

describe('renderAsyncGen renders an async generator out', () => {
    const entries = range(0, 20);
    it('render async generator', async () => {
        const asyncGen = async function* () {
            for(let i of [...entries]) {
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
    const config: ICanvasCallConfig = { fetchInit: {} };
    const goobers: Goober[] = [...range(0, 10)].map(i => ({name: 'thistle', courseId: i, gooberId: i}));

    const fetchMock = fetch as jest.Mock;

    it('successfully generates urls and results', async () => {
        const fetchGoobersGen = canvasDataFetchGenFunc<Goober, { courseId: number, gooberId: number}>(({courseId, gooberId}) => `/api/v1/${courseId}/${gooberId}`);
        for  (let i = 0; i < 10; i++) {
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