import {deepObjectMerge, ICanvasCallConfig} from "@/canvas/canvasUtils";
import {CanvasData} from "@/canvas/canvasDataDefs";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";

type UrlFuncType<UrlParams extends Record<string, any>> = (args: UrlParams, config?: ICanvasCallConfig) => string

export function overrideConfig<ConfigType extends ICanvasCallConfig>(
    source: ConfigType | undefined,
    override: ConfigType | undefined
) {

    return deepObjectMerge(source, override) ?? {} as ConfigType;
}

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

export async function renderAsyncGen<T>(generator: AsyncGenerator<T, any, undefined>) {
    const out = [];
    for await (let item of generator) {
        out.push(item);
    }
    return out;
}

export function fetchGetConfig<CallOptions extends Record<string, any>>(options: CallOptions, baseConfig?: ICanvasCallConfig<CallOptions>) {
    return overrideConfig(baseConfig, {
        queryParams: options,
    });
}