import {ICanvasCallConfig} from "@ueu/ueu-canvas/canvasUtils";

export async function fetchJson<T = Record<string, any>>(
    url: string, config: ICanvasCallConfig | null = null
): Promise<T> {
    const match = url.search(/^(\/|\w+:\/\/)/);
    if (match < 0) throw new Error("url does not start with / or http")
    if (config?.queryParams) {
        url += '?' + new URLSearchParams(config.queryParams);
    }
    config ??= {};


    const response = await fetch(url, config.fetchInit);
    return await response.json() as T;
}


