import {fetchJson} from "@/canvas/fetch/fetchJson";
import {IQueryParams} from "@/canvas/canvasUtils";
import {apiGetConfig, apiWriteConfig} from "@/canvas";

const baseUrl = 'https://api.citeas.org/product'

export default async function getReferencesForText(text:string, userEmail:string, queryParams?:IQueryParams) {
    queryParams ??= {};
    queryParams.email = userEmail;
    const result = await fetchJson(baseUrl, apiGetConfig(queryParams))
    return result;
}