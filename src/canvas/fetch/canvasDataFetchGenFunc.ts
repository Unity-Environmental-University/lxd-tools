import {ICanvasCallConfig} from "@/canvas/canvasUtils";
import {CanvasData} from "@/canvas/canvasDataDefs";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";
import {overrideConfig} from "@/canvas";

type UrlFuncType<UrlParams extends Record<string, any>> = (args: UrlParams, config?: ICanvasCallConfig) => string

export function canvasDataFetchGenFunc<
    Content extends CanvasData,
    UrlParams extends Record<string, any>
>(urlFunc: UrlFuncType<UrlParams>, defaultConfig?: ICanvasCallConfig) {

    return function (args: UrlParams, config?: ICanvasCallConfig) {
        config = overrideConfig(defaultConfig, config);
        const url = urlFunc(args, config);
        return getPagedDataGenerator<Content>(url, config);
    }
}

