import {formDataify, ICanvasCallConfig} from "./canvasUtils";

import {overrideConfig} from "@/canvas/fetch/index";


export function apiWriteConfig(method: 'POST' | 'PUT', data: Record<string, any>, baseConfig?: ICanvasCallConfig) {
    const body = formDataify(data);
    return overrideConfig({
        fetchInit: {
            method,
            body,
        }
    }, baseConfig);
}


export {overrideConfig} from "@/canvas/fetch/index";