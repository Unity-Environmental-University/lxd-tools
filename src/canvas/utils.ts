import assert from "assert";
import {CanvasData, IModuleItemData, IPageData, ModuleItemType, RestrictModuleItemType} from "./canvasDataDefs";
import {Course} from "./index";
import Func = jest.Func;



/**
 * Takes in a list of functions and calls all of them, returning the result.
 * @param funcs A list of functions, or a list of { func, params } pairs to run, passing params into func
 * @param params optional params to pass into each run of the function
 */
function callAll<T>(funcs:(()=>T)[]):T[]
function callAll<T, ParamType>(funcs: {func:()=>ParamType, params: ParamType}[]):T[]
function callAll<T, ParamType>(funcs: ((params:ParamType)=> T)[], params:ParamType):T[]
function callAll<T,
    WithParamsFuncType extends (params:FunctionParamsType) => T,
    WithoutParamsFuncType extends () => T,
    FuncObject extends { func:WithParamsFuncType,params: FunctionParamsType },
    FuncType extends FuncObject | WithoutParamsFuncType | WithParamsFuncType,
    PassedInParamsType extends FunctionParamsType,
    FunctionParamsType extends (FuncType extends WithoutParamsFuncType? undefined : any) = undefined,
>(funcs:FuncType[] | WithParamsFuncType[], params?:PassedInParamsType) {
    console.log(funcs);
    const output: T[] = [];
    function isWithParamsFunc (func:FuncObject|WithParamsFuncType|WithoutParamsFuncType): func is WithParamsFuncType {
        if('arguments' in func) return func.arguments.length > 0;
        return false;
    }
    function isWithoutParamsFunc (func:FuncObject|WithParamsFuncType|WithoutParamsFuncType): func is WithoutParamsFuncType {
        if('arguments' in func) return func.arguments.length === 0;
        return false;
    }

    for(let func of funcs) {
         if((typeof func === 'object')) {
             output.push(func.func(func.params))
             continue;
         }
         if(isWithoutParamsFunc(func)) {
             output.push(func());
             continue;
         }
         if(isWithParamsFunc(func) && typeof params !== 'undefined') {
             output.push(func(params));
             continue;
         }
    }
    return output;
}


callAll([
    (value:string)=>value.toUpperCase(),
    (value:string)=>value.toLowerCase(),
], 'Hello')

export { callAll }

export function parentElement(el: Element, tagName: string) {
    while (el && el.parentElement) {
        el = el.parentElement;
        if (el.tagName && el.tagName.toLowerCase() == tagName) {
            return el;
        }
    }
}

export interface ICanvasCallConfig {
    fetchInit?: RequestInit,
    queryParams?: Record<string, any>
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
    console.log('form', data);
    let formData = new FormData();
    for (let key in data) {
        addToFormData(formData, key, data[key]);
    }

    if (document) {
        const el: HTMLInputElement | null = document.querySelector("input[name='authenticity_token']");
        const authenticityToken = el ? el.value : null;
        if (authenticityToken) formData.append('authenticity_token', authenticityToken);
    }
    return formData;
}

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

export function getModuleWeekNumber(module: Record<string, any>) {
    const regex = /(week|module) (\d+)/i;
    let match = module.name.match(regex);
    let weekNumber = !match ? null : Number(match[1]);
    if (!weekNumber) {
        for (let moduleItem of module.items) {
            if (!moduleItem.hasOwnProperty('title')) {
                continue;
            }
            let match = moduleItem.title.match(regex);
            if (match) {
                weekNumber = match[2];
            }
        }
    }
    return weekNumber;
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
function searchParamsFromObject(queryParams: string[][] | Record<string, string>): URLSearchParams {
    return new URLSearchParams(queryParams);
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

    const out:T[] = [];
    for await (let value of generator) {
        out.push(value);
    }
    return out;
}

export async function* getPagedDataGenerator<T extends CanvasData = CanvasData>(
    url: string, config: ICanvasCallConfig | null = null
): AsyncGenerator<T, T[], void> {

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
    for(let value of data) {
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
            if (typeof responseData === 'object' && !Array.isArray(data)) {
                let values = Array.from(Object.values(data));
                if (values) {
                    responseData = values?.find((a) => Array.isArray(a));
                }
                data = [data, ...responseData];
            }
            for(let value of responseData) {
                yield value;
            }
        } else {
            next_page_link = "";
        }
    }

    return data;
}


export async function fetchJson<T extends Record<string, any>>(
    url: string, config: ICanvasCallConfig | null = null
): Promise<T | T[]> {
    if (config?.queryParams) {
        url += '?' + new URLSearchParams(config.queryParams);
    }
    config ??= {};
    if (!document) {
        config.fetchInit ??= {};
        config.fetchInit.headers = [];
    }

    const response = await fetch(url, config.fetchInit);
    return await response.json();
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

export function courseNameSort(a: Course, b: Course) {
    if (a.name < b.name) return -1;
    if (b.name < a.name) return 1;
    return 0;

}