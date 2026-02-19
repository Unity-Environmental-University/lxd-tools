import {deepObjectMerge, ICanvasCallConfig} from "@ueu/ueu-canvas/canvasUtils";

export function overrideConfig<ConfigType extends ICanvasCallConfig | undefined>(
    source: ConfigType | undefined,
    override: ConfigType | undefined
) {

    return deepObjectMerge(source, override) ?? {} as ConfigType;
}

export function fetchGetConfig<CallOptions extends Record<string, any>>(options: CallOptions, baseConfig?: ICanvasCallConfig<CallOptions>) {
    return overrideConfig(baseConfig, {
        queryParams: options,
    });
}

