import {ICanvasCallConfig, IQueryParams} from "@/canvas/canvasUtils";
import {fetchJson} from "@/canvas/fetch/fetchJson";

import {putContentConfig} from "@/canvas/content/BaseContentItem";
import {CanvasData} from "@/canvas/canvasDataDefs";
import {getContentItemFromUrl} from "@/canvas/content/contentFromUrl";
import {canvasDataFetchGenFunc} from "@/canvas/fetch/canvasDataFetchGenFunc";
import {overrideConfig} from "@/canvas";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";

export type ContentFuncsOptions<
    GetOptionsType extends IQueryParams,
    GetAllOptionsType extends IQueryParams = GetOptionsType,
    PutDataType extends Record<string, any> = Record<string, any>
> = {

    defaultGetQuery?:GetOptionsType,
    defaultGetAllQuery?:GetAllOptionsType,

}

export function contentUrlFuncs(contentUrlPart: string,) {
    return {
        getApiUrl: courseContentUrlFunc(`/api/v1/courses/{courseId}/${contentUrlPart}/{contentId}`),
        getAllApiUrl: (courseId:number) => `/course/{courseId}/${contentUrlPart}`,
        getHtmlUrl: courseContentUrlFunc(`/courses/{courseId}/${contentUrlPart}/{contentId}`),
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
>(getApiUrl:(courseId:number, contentId:number) => string) {
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
