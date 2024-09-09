import {ICanvasCallConfig, IQueryParams} from "@canvas/canvasUtils";
import {overrideConfig} from "@canvas/fetch/utils";

export function apiGetConfig(queryParams: IQueryParams, baseConfig?: ICanvasCallConfig) {
    return overrideConfig({
        queryParams,
    }, baseConfig);
}

export default apiGetConfig;