import {formDataify, ICanvasCallConfig} from "@ueu/ueu-canvas/canvasUtils";
import {overrideConfig} from "@ueu/ueu-canvas/fetch/utils";

export function apiWriteConfig(method: 'POST' | 'PUT', data: Record<string, any>, baseConfig?: ICanvasCallConfig) {
    const body = formDataify(data);
    return overrideConfig({
        fetchInit: {
            method,
            body,
        }
    }, baseConfig);
}
export default apiWriteConfig;