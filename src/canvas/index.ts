import {formDataify, ICanvasCallConfig, IQueryParams} from "./canvasUtils";

import {overrideConfig} from "@/canvas/fetch/utils";


export function apiWriteConfig(method: 'POST' | 'PUT', data: Record<string, any>, baseConfig?: ICanvasCallConfig) {
    const body = formDataify(data);
    return overrideConfig({
        fetchInit: {
            method,
            body,
        }
    }, baseConfig);
}


export function apiGetConfig(queryParams: IQueryParams, baseConfig?: ICanvasCallConfig) {
    return overrideConfig({
        queryParams,
    }, baseConfig);
}


export {overrideConfig} from "@/canvas/fetch/utils";
export {generatorMap} from "@/canvas/canvasUtils";
export {renderAsyncGen} from "@/canvas/canvasUtils";