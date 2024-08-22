import {fetchJson} from "@/canvas/fetch/fetchJson";
import {ICanvasCallConfig, renderAsyncGen} from "@/canvas/canvasUtils";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";
import {mockAsyncGen} from "@/__mocks__/utils";
import assert from "assert";
import {putContentConfig} from "@/canvas/content/BaseContentItem";
import {ContentKind, contentUrlFuncs} from "@/canvas/content/ContentKind";

export function kindUrlTests(urlFuncs: ReturnType<typeof contentUrlFuncs>, courseId: number, contentId: number, apiUrl: string, htmlUrl: string, allUrl: string) {
    return () => {
        it("getApiUrl", () => expect(urlFuncs.getApiUrl(1, 3)).toEqual(apiUrl))
        it("getHtmlUrl", () => expect(urlFuncs.getHtmlUrl(1, 3)).toEqual(htmlUrl))
        it("getAllUrl", () => expect(urlFuncs.getAllApiUrl(1)).toEqual(allUrl))
    }
}

export type KindDataType<T extends ContentKind<any, any, any>> = Awaited<ReturnType<T['get']>>;
export type KindSaveType<T> = T extends ContentKind<infer A, infer B, infer C> ? B : never;

export function getDataTests<Kind extends ContentKind<any, any, any>>(contentKind: Kind, mockDatas: KindDataType<Kind>[], mockSaveParams: KindSaveType<Kind>) {
    type DataType = KindDataType<Kind>
    type SaveType = KindSaveType<Kind>
    return () => {
        it('get works', async () => {
            const content = {...mockDatas[0], id: 101};
            (fetchJson as jest.Mock).mockResolvedValue(content);
            const config: ICanvasCallConfig = {};
            const received = await contentKind.get(0, 0, config);
            expect(received).toEqual(content);
            expect(fetchJson).toHaveBeenCalledWith(contentKind.getApiUrl(0, 0), config)
        });
        it('dataGenerator works', async () => {
            (getPagedDataGenerator as jest.Mock).mockReturnValue(mockAsyncGen(mockDatas));
            expect(await renderAsyncGen(contentKind.dataGenerator(1))).toEqual(mockDatas);
        });
        it('puts data', async() => {
            (fetchJson as jest.Mock).mockResolvedValue(mockDatas[0])
            if (!contentKind.put) {
                expect(mockSaveParams).toBeUndefined();
                return;
            }
            const result = await contentKind.put(1, 1, mockSaveParams);
            expect(contentKind.dataIsThisKind(result))
            expect(fetchJson as jest.Mock).toHaveBeenCalledWith(contentKind.getApiUrl(1, 1), putContentConfig(mockSaveParams, {}))
        })
    }
}