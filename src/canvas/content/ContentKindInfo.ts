import {ICanvasCallConfig, IQueryParams} from "@/canvas/canvasUtils";
import {CanvasData} from "@/canvas/canvasDataDefs";

export type ContentKindInfo<
    DataType extends CanvasData,
    GetQueryOptions extends IQueryParams = Record<string, any>,
    PutDataType extends CanvasData = DataType,
> = {
    getName: (data: DataType) => string,
    getBody: (data: DataType) => string | undefined,
    getHtmlUrl: (courseId: number, contentId: number) => string | undefined,
    getApiUrl: (courseId: number, contentId: number) => string,
    getAllApiUrl: (courseId: number) => string,
    get: (courseId:number, contentId:number, config?:ICanvasCallConfig<GetQueryOptions>) => Promise<DataType>
    dataGenerator: (courseId:number, config?:ICanvasCallConfig<GetQueryOptions>) => AsyncGenerator<DataType>
    put?: (courseId: number, contentId: number, data:PutDataType) => Promise<DataType>,
}