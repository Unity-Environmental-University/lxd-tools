import {ICanvasCallConfig, IQueryParams} from "@ueu/ueu-canvas/canvasUtils";
import {overrideConfig} from "@ueu/ueu-canvas/fetch/utils";

export function apiGetConfig(queryParams: IQueryParams, baseConfig?: ICanvasCallConfig) {
    return overrideConfig({
        queryParams,
    }, baseConfig);
}

export default apiGetConfig;