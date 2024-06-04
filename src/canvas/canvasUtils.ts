import assert from "assert";
import {
    CanvasData,
    ICourseData,
    IModuleItemData,
    IPageData,
    ModuleItemType,
    RestrictModuleItemType
} from "./canvasDataDefs";

import {Course} from "./course";


/**
 * Takes in a list of functions and calls all of them, returning the result.
 * This is an abomination.
 * @param funcs A list of functions, or a list of { func, params } pairs to run, passing params into func
 * @param params optional params to pass into each run of the function
 */
function callAll<T>(funcs: (() => T)[]): T[]
function callAll<T, ParamType>(funcs: { func: (params: ParamType) => T, params: ParamType }[]): T[]
function callAll<T, ParamType>(funcs: ((params: ParamType) => T)[], params: ParamType): T[]
function callAll<T,
    WithParamsFuncType extends (params: FunctionParamsType) => T,
    WithoutParamsFuncType extends () => T,
    FuncObject extends { func: WithParamsFuncType, params: FunctionParamsType },
    FuncType extends FuncObject | WithoutParamsFuncType | WithParamsFuncType,
    PassedInParamsType extends FunctionParamsType,
    FunctionParamsType extends (FuncType extends WithoutParamsFuncType ? undefined : any) = undefined,
>(funcs: FuncType[] | WithParamsFuncType[], params?: PassedInParamsType) {
    const output: T[] = [];

    function isWithParamsFunc(func: FuncObject | WithParamsFuncType | WithoutParamsFuncType): func is WithParamsFuncType {
        return typeof func === 'function' && func.length > 0;
    }

    function isWithoutParamsFunc(func: FuncObject | WithParamsFuncType | WithoutParamsFuncType): func is WithoutParamsFuncType {
        return typeof func === 'function' && func.length === 0;
    }

    for (let func of funcs) {
        if ((typeof func === 'object')) {
            output.push(func.func(func.params))
            continue;
        }
        if (isWithoutParamsFunc(func)) {
            output.push(func());
            continue;
        }
        if (isWithParamsFunc(func) && typeof params !== 'undefined') {
            output.push(func(params));
        }
    }
    return output;
}

export {callAll}

/**
 * Traverses up the DOM and finds a parent with a matching Tag
 * @param el
 * @param tagName
 */
export function parentElement(el: Element | null, tagName: string) {
    if (!el) return null;
    while (el && el.parentElement) {
        el = el.parentElement;
        if (el.tagName && el.tagName.toLowerCase() == tagName) {
            return el;
        }
    }
    return null;
}


export interface IQueryParams extends Record<string, any> {
    include?: (string | number)[]
}

export interface ICanvasCallConfig<QueryParamsType extends IQueryParams = IQueryParams> {
    fetchInit?: RequestInit,
    queryParams?: QueryParamsType
}

const type_lut: Record<ModuleItemType, RestrictModuleItemType | null> = {
    Assignment: 'assignment',
    Discussion: 'discussion_topic',
    Quiz: 'quiz',
    ExternalTool: 'external_tool',
    File: 'attachment',
    Page: 'wiki_page',
    ExternalUrl: null, //Not passable to restrict
    Subheader: null, //Not passable to restrict

}

export function formDataify(data: Record<string, any>) {
    let formData = new FormData();
    for (let key in data) {
        addToFormData(formData, key, data[key]);
    }

    if (document) {
        const el: HTMLInputElement | null = document.querySelector("input[name='authenticity_token']");
        const authenticityToken = el ? el.value : null;
        const cookies = getCookies();
        let csrfToken = cookies['_csrf_token'];
        if (authenticityToken) formData.append('authenticity_token', authenticityToken);
        else if (csrfToken) {
            csrfToken = csrfToken.replaceAll(/%([0-9A-F]{2})/g, (substring, hex) => {
                const hexCode = hex;
                return String.fromCharCode(parseInt(hexCode, 16))
            })

            console.log(csrfToken);
            formData.append('authenticity_token', csrfToken);
        }
    }
    return formData;
}


export function recursiveMerge<ReturnType extends string | number | File | Record<string, any> | []>(
    a: ReturnType | null | undefined,
    b: ReturnType | null | undefined,
    complexObjectsTracker: Array<unknown> = [],
): ReturnType | undefined | null {
    for (let value of [a, b]) {
        if (typeof value == "object" &&
            complexObjectsTracker.includes(value)) throw new Error(`Infinite Loop: Element ${value} contains itself`);
    }

    //if the types don't match
    if (a && b && (
        typeof a !== typeof b ||
        Array.isArray(a) != Array.isArray(b)
    )) {
        if (a === b) return a;
        throw new Error(`Type clash on merge ${typeof a} ${a}, ${typeof b} ${b}`);
    }

    //If either or both are arrays, merge if able to
    if (Array.isArray(a)) {
        if (!b) return recursiveMerge(a, [] as ReturnType, complexObjectsTracker);
        assert(Array.isArray(b), "We should not get here if b is not an array")
        let mergedArray = [...a, ...b];
        const outputArray = mergedArray.map(value => {
            if (typeof value === 'object') value = recursiveMerge(value, null, [...complexObjectsTracker, a, b]);
            return value;
        }) as ReturnType
        return outputArray;
    }

    if (Array.isArray(b)) return recursiveMerge(b, [] as ReturnType); //we already know a is not an array at this point, return a deep copy of b

    if ((a && typeof a === 'object') || (b && typeof b === 'object')) {
        if (a instanceof File && b instanceof File) {
            assert(a.size == b.size && a.name == b.name, `File value clash ${a.name} ${b.name}`);
            return a;
        }
        if (a instanceof File) return a;
        if (b instanceof File) return b;

        if (!b) return recursiveMerge(a, {} as ReturnType, complexObjectsTracker);
        if (!a) return recursiveMerge(b, {} as ReturnType, complexObjectsTracker);
        assert(a && typeof a === 'object', "a should always be defined here.")
        assert(b && typeof b === 'object', "b should always be defined here.")

        const allKeys = [...Object.keys(a), ...Object.keys(b)].filter(filterUniqueFunc);
        const entries = allKeys.map((key: string) => [
            key,
            recursiveMerge(a[key], b[key], [...complexObjectsTracker, a, b])
        ]);
        return Object.fromEntries(entries)
    }
    if (a && b && a !== b) throw new Error(`Values unmergeable, ${a}>:${typeof a}, ${b} ${typeof b}`)
    if (a) return a;
    if (b) return b;
    if (a === null) return a;
    if (b === null) return b;
}

export interface FormMergeOutput {
    [key: string]: FormMergeOutput | FormDataEntryValue | FormDataEntryValue[]
}

export function deFormDataify(formData: FormData) {
    return [...formData.entries()].reduce((aggregator, [key, value]) => {
        const isArray = key.includes('[]');
        const keys = key.split('[').map(key => key.replaceAll(/[\[\]]/g, ''));
        if(isArray) keys.pop(); //remove the last, empty, key if it's an array
        let currentValue: FormDataEntryValue | FormDataEntryValue[] | FormMergeOutput = isArray? [value] : value;
        while (keys.length > 0) {
            let newValue: Record<string, any>;
            newValue = {
                [keys.pop() as string]: currentValue
            };
            currentValue = newValue;

        }
        console.log(JSON.stringify(aggregator));
        return recursiveMerge(aggregator, currentValue as FormMergeOutput) || {...aggregator};
    }, {} as FormMergeOutput);
}


function getCookies() {
    const cookieString = document.cookie;
    const cookies = cookieString.split('; ')
    const out: Record<string, string> = {};
    for (let cookie of cookies) {
        const [key, value] = cookie.split('=')
        out[key] = value;
    }
    return out;
}

/**
 * Adds arrays and objects in the form formData posts expects
 * @param formData
 * @param key
 * @param value
 */
function addToFormData(formData: FormData, key: string, value: any | Record<string, any> | []) {
    if (Array.isArray(value)) {
        for (let item of value) {
            addToFormData(formData, `${key}[]`, item);
        }
    } else if (typeof value === 'object') {
        for (let itemKey in value) {
            const itemValue = value[itemKey];
            addToFormData(formData, key.length > 0 ? `${key}[${itemKey}]` : itemKey, itemValue);
        }
    } else {
        formData.append(key, value.toString());
    }
}


export function queryStringify(data: Record<string, any>) {
    let searchParams = new URLSearchParams();
    for (let key in data) {
        addToQuery(searchParams, key, data[key])
    }
    ;
    return searchParams;
}

function addToQuery(searchParams: URLSearchParams, key: string, value: any | Record<string, any> | []) {
    if (Array.isArray(value)) {
        for (let item of value) {
            addToQuery(searchParams, `${key}[]`, item);
        }
    } else if (typeof value === 'object') {
        for (let itemKey in value) {
            const itemValue = value[itemKey];
            addToQuery(searchParams, key.length > 0 ? `${key}[${itemKey}]` : itemKey, itemValue);
        }
    } else {
        searchParams.append(key, value)
    }
}


/**
 * Takes in a module item and returns an object specifying its type and content id
 * @param item
 */
export async function getItemTypeAndId(
    item: IModuleItemData
): Promise<{ type: RestrictModuleItemType | null, id: number }> {
    let id;
    let type;
    assert(type_lut.hasOwnProperty(item.type), "Unexpected type " + item.type);

    type = type_lut[item.type];
    if (type === "wiki_page") {
        assert(item.url); //wiki_page items always have a url param
        const pageData = await fetchJson(item.url) as IPageData;
        id = pageData.page_id;
    } else {
        id = item.content_id;
    }

    return {type, id}
}

/**
 * @param queryParams
 * @returns {URLSearchParams} The correctly formatted parameters
 */
export function searchParamsFromObject(queryParams: string[][] | Record<string, string>): URLSearchParams {
    return queryStringify(queryParams);


}

export async function getApiPagedData<T extends CanvasData>(url: string, config: ICanvasCallConfig | null = null): Promise<T[]> {
    return await getPagedData<T>(`/api/v1/${url}`, config)
}

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
        for await(let result of generator) yield result;
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
    assert(Array.isArray(data));
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

/**
 * Fetches a json object from /api/v1/${url}
 * @param url
 * @param config query and fetch params
 */
export async function fetchApiJson<T extends Record<string, any>>(url: string, config: ICanvasCallConfig | null = null) {
    url = `/api/v1/${url}`;
    return await fetchJson<T>(url, config);
}

export async function fetchOneKnownApiJson<T extends Record<string, any>>(url: string, config: ICanvasCallConfig | null = null) {
    let result = await fetchApiJson<T>(url, config);
    assert(result);
    if (Array.isArray(result)) return result[0];
    return result as T;
}

export async function fetchOneUnknownApiJson(url: string, config: ICanvasCallConfig | null = null) {
    let result = await fetchApiJson(url, config);
    if (!result) return null;
    if (Array.isArray(result) && result.length > 0) return result[0];
    return <CanvasData>result;
}

/**
 * sort courses (or course Data) alphabetically by name
 * @param a item to compare.
 * @param b item to compare.
 */
export function courseNameSort(a: Course | ICourseData, b: Course | ICourseData) {
    if (a.name < b.name) return -1;
    if (b.name < a.name) return 1;
    return 0;

}

export function* range(start: number, end: number) {
    for (let i = start; i <= end; i++) {
        yield i;
    }
}


export function getPlainTextFromHtml(html: string) {
    const el = document.createElement('div');
    el.innerHTML = html;
    return el.innerText || el.textContent || "";
}


export function getCourseIdFromUrl(url: string) {
    let match = /courses\/(\d+)/.exec(url);
    if (match) {
        return parseInt(match[1]);
    }
    return null;
}

export function batchify<T>(toBatch: T[], batchsize: number) {
    const out: T[][] = [];
    for (let i = 0; i < toBatch.length; i += batchsize) {
        out.push(toBatch.slice(i, i + batchsize));

    }
    return out;
}

export function filterUniqueFunc<T>(item: T, index: number, array: T[]) {
    return array.indexOf(item) === index;
}
