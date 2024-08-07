import {CanvasData} from "@/canvas/canvasDataDefs";
import {ICanvasCallConfig, searchParamsFromObject} from "@/canvas/canvasUtils";

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

function handleResponseData<T extends CanvasData>(data: T, url: string) {
    if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
        let values = Array.from(Object.values(data));
        if (values) {
            data = values.find((a) => Array.isArray(a));
        }
    }
    if (!Array.isArray(data)) {
        console.warn(`no data for ${url}`)
        return [];
    }
    return data;

}

export async function* getPagedDataGenerator<T extends CanvasData = CanvasData>(
    url: string, config: ICanvasCallConfig | null = null
): AsyncGenerator<T> {

    if (config?.queryParams) {
        url += '?' + searchParamsFromObject(config.queryParams);
    }

    if (url.includes('undefined')) {
        console.warn(url);
    }


    /* Returns a list of data from a GET request, going through multiple pages of data requests as necessary */
    let response = await fetch(url, config?.fetchInit);
    let data = handleResponseData(await response.json(), url);
    if (data.length === 0) return data;
    for (let value of data) yield value;

    let next_page_link = "!";
    while (next_page_link.length !== 0 &&
    response &&
    response.ok) {
        const nextLink = getNextLink(response);
        if (!nextLink) break;
        next_page_link = nextLink.split(";")[0].split("<")[1].split(">")[0];
        response = await fetch(next_page_link, config?.fetchInit);
        let responseData = handleResponseData<T>(await response.json(), url);
        data = [data, ...responseData];

        for (let value of responseData) {
            yield value;
        }
    }
}

function getNextLink(response: Response) {
    const link = response.headers.get("Link");
    if (!link) return null;
    const paginationLinks = link.split(",");

    return paginationLinks.find((link) => link.includes('next'));

}