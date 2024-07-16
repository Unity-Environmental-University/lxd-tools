import {deepObjectMerge, ICanvasCallConfig} from "@/canvas/canvasUtils";

export function overrideConfig<ConfigType extends ICanvasCallConfig | undefined>(
    source: ConfigType | undefined,
    override: ConfigType | undefined
) {

    return deepObjectMerge(source, override) ?? {} as ConfigType;
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

export async function* generatorMap<T, MapOutput>(
    generator: AsyncGenerator<T>,
    nextMapFunc: (value: T, index: number, generator: AsyncGenerator<T>) => MapOutput,
) {

    let i = 0;
    for await(let value of generator) {
        yield nextMapFunc(value, i, generator);
        i++;
    }
}