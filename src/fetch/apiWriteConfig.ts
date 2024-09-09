import {formDataify, ICanvasCallConfig} from "@canvas/canvasUtils";
import {overrideConfig} from "@canvas/fetch/utils";

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