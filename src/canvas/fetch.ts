import {CanvasData} from "./canvasDataDefs";
import assert from "assert";
import {ICanvasCallConfig, searchParamsFromObject} from "./canvasUtils";

/**
 * @param url The entire path of the url
 * @param config a configuration object of type ICanvasCallConfig
 * @returns {Promise<Record<string, any>[]>}
 */
export async function getPagedData<T extends CanvasData = CanvasData>(
    url: string, config: ICanvasCallConfig | null = null
): Promise<T[]> {

    const generator = getPagedDataGenerator<T>(url, config);

    const out: T[] = [];
    for await (let value of generator) {
        out.push(value);
    }
    return out;
}

/**
 * returns a single pagedDataGenerator that returns generator results from each, looping through results for each
 * @param generators
 */
export async function* mergePagedDataGenerators<T extends CanvasData = CanvasData>(generators: AsyncGenerator<T, T[], void>[]) {
    for (let generator of generators) {
        for await(let result of generator) {
            yield result;
        }
    }
}

export async function* getPagedDataGenerator<T extends CanvasData = CanvasData>(
    url: string, config: ICanvasCallConfig | null = null
): AsyncGenerator<T> {

    if (config?.queryParams) {
        url += '?' + searchParamsFromObject(config.queryParams);
    }

    if (url.includes('undefined')) {
        console.log(url);
    }
    /* Returns a list of data from a GET request, going through multiple pages of data requests as necessary */
    let response = await fetch(url, config?.fetchInit);
    let data = await response.json();
    if (typeof data === 'object' && !Array.isArray(data)) {
        let values = Array.from(Object.values(data));
        if (values) {
            data = values.find((a) => Array.isArray(a));
        }
    }
    if (!Array.isArray(data)) {
        console.warn(`no data for ${url}`)
        return [];
    }
    for (let value of data) {
        yield value;
    }

    let next_page_link = "!";
    while (next_page_link.length !== 0 &&
    response &&
    response.headers.has("Link") && response.ok) {
        const link = response.headers.get("Link");
        assert(link);
        const paginationLinks = link.split(",");

        const nextLink = paginationLinks.find((link) => link.includes('next'));
        if (nextLink) {
            next_page_link = nextLink.split(";")[0].split("<")[1].split(">")[0];
            response = await fetch(next_page_link, config?.fetchInit);
            let responseData = await response.json();
            if (typeof responseData === 'object' && !Array.isArray(responseData)) {
                let values = Array.from(Object.values(responseData));
                if (values) {
                    responseData = values?.find((a) => Array.isArray(a));
                }
                data = [data, ...responseData];
            }

            for (let value of responseData) {
                yield value;
            }
        } else {
            next_page_link = "";
        }
    }
}

export async function fetchJson<T extends Record<string, any>>(
    url: string, config: ICanvasCallConfig | null = null
): Promise<T> {
    if (config?.queryParams) {
        url += '?' + new URLSearchParams(config.queryParams);
    }
    config ??= {};
    if (!document) {
        config.fetchInit ??= {};
        config.fetchInit.headers = [];
    }

    const response = await fetch(url, config.fetchInit);
    return await response.json() as T;
}

type UrlFuncType<UrlParams extends Record<string, any>> = (args: UrlParams, config?: ICanvasCallConfig) => string

export function canvasDataFetchGenFunc<
    Content extends CanvasData,
    UrlParams extends Record<string, any>
>(urlFunc: UrlFuncType<UrlParams>) {

    return function (args: UrlParams, config?: ICanvasCallConfig) {
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