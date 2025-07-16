import {ICanvasCallConfig, IQueryParams} from "@/canvas/canvasUtils";
import {CanvasData} from "@/canvas/canvasDataDefs";
import {ContentData} from "@/canvas/content/types";
import {fetchJson} from "@/canvas/fetch/fetchJson";
import {postContentConfig, putContentConfig} from "@/canvas/content/BaseContentItem";
import {GetByStringIdOptions} from "@canvas/content/pages/PageKind";


export type ContentKind<
    DataType extends ContentData,
    GetQueryOptions extends IQueryParams = Record<string, any>,
    PutDataType extends CanvasData = DataType,
    PostDataType extends CanvasData = PutDataType,
    IdType = number,
> = {
    getId: (data: DataType) => IdType,
    dataIsThisKind: (data: Record<string, any>) => data is DataType,
    getName: (data: DataType) => string,
    getBody: (data: DataType) => string | undefined,
    get: (courseId: number, contentId: number, config?: ICanvasCallConfig<GetQueryOptions>) => Promise<DataType>
    getByString?: (courseId: number, contentId: string, config?: ICanvasCallConfig<GetQueryOptions>, options?: GetByStringIdOptions) => Promise<DataType|{ message: string}>
    dataGenerator: (courseId: number, config?: ICanvasCallConfig<GetQueryOptions>) => AsyncGenerator<DataType>
    put: (courseId: number, contentId: number, data: PutDataType) => Promise<DataType>,
    post?: (courseId: number, data: PostDataType) => Promise<DataType>,
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
        contentUrlPart,
        getApiUrl,
        getAllApiUrl,
        getHtmlUrl,
        getCourseAndContentIdFromUrl,
        isValidUrl,
    }
}

export function courseContentUrlFunc<T extends number | string = number>(url: string) {
    return (courseId: number, contentId: T) => url
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


export function postContentFunc<
    PostOptionsType extends Record<string, any>,
    ResponseDataType extends Record<string, any>
>(getApiUrl: (courseId: number) => string) {
    return async function (
        courseId: number,
        content: PostOptionsType,
        config?: ICanvasCallConfig
    ) {
        const url = getApiUrl(courseId);
        return await fetchJson<ResponseDataType>(url, postContentConfig(content, config))
    }
}

