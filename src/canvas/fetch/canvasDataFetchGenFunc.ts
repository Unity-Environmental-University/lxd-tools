import {ICanvasCallConfig} from "@ueu/ueu-canvas/canvasUtils";
import {CanvasData} from "@ueu/ueu-canvas/canvasDataDefs";
import {getPagedDataGenerator} from "@ueu/ueu-canvas/fetch/getPagedDataGenerator";
import {overrideConfig} from "@ueu/ueu-canvas/fetch/utils";


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

