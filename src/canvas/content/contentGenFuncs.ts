import {ICanvasCallConfig, IQueryParams} from "@/canvas/canvasUtils";
import {fetchJson} from "@/canvas/fetch/fetchJson";

import {putContentConfig} from "@/canvas/content/BaseContentItem";
import {CanvasData} from "@/canvas/canvasDataDefs";


export type ContentFuncsOptions<
    GetOptionsType extends IQueryParams,
    GetAllOptionsType extends IQueryParams = GetOptionsType,
    PutDataType extends Record<string, any> = Record<string, any>
> = {

    defaultGetQuery?: GetOptionsType,
    defaultGetAllQuery?: GetAllOptionsType,

}

export type ContentKind<
    DataType extends CanvasData,
    GetQueryOptions extends IQueryParams = Record<string, any>,
    PutDataType extends CanvasData = DataType,
    IdType = number,
> = {
    getId: (data: DataType) => IdType,
    getName: (data: DataType) => string,
    getBody: (data: DataType) => string | undefined,
    get: (courseId: number, contentId: number, config?: ICanvasCallConfig<GetQueryOptions>) => Promise<DataType>
    dataGenerator: (courseId: number, config?: ICanvasCallConfig<GetQueryOptions>) => AsyncGenerator<DataType>
    put?: (courseId: number, contentId: number, data: PutDataType) => Promise<DataType>,
} & ReturnType<typeof contentUrlFuncs>

export function contentUrlFuncs(contentUrlPart: string) {

    const urlRegex = new RegExp(`courses\/(\\d+)\/${contentUrlPart}/(\\d+)`, 'i');

    const getApiUrl = courseContentUrlFunc(`/api/v1/courses/{courseId}/${contentUrlPart}/{contentId}`);
    const getAllApiUrl = (courseId: number) => `/api/v1/courses/${courseId}/${contentUrlPart}`;
    const getHtmlUrl = courseContentUrlFunc(`/courses/{courseId}/${contentUrlPart}/{contentId}`);
    function getCourseAndContentIdFromUrl(url: string) {
        const [full, courseId, contentId] = url.match(urlRegex) ?? [undefined, undefined, undefined];
        return [courseId, contentId].map(a => a ? parseInt(a) : undefined);
    }
    const isValidUrl = (url?: string) => typeof url === 'string' && typeof getCourseAndContentIdFromUrl(url)[0] !== 'undefined';
    return {
        getApiUrl,
        getAllApiUrl,
        getHtmlUrl,
        getCourseAndContentIdFromUrl,
        isValidUrl,
    }
}

function courseContentUrlFunc(url: string) {
    return (courseId: number, contentId: number) => url
        .replaceAll('{courseId}', courseId.toString())
        .replaceAll('{contentId}', contentId.toString())
}

export function putContentFunc<
    PutOptionsType extends Record<string, any>,
    ResponseDataType extends Record<string, any>
>(getApiUrl: (courseId: number, contentId: number) => string) {
    return async function (
        courseId: number,
        contentId: number,
        content: PutOptionsType,
        config?: ICanvasCallConfig
    ) {
        const url = getApiUrl(courseId, contentId);
        return await fetchJson<ResponseDataType>(url, putContentConfig(content, config))
    }
}