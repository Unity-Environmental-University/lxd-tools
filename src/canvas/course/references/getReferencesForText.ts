import {fetchJson} from "@ueu/ueu-canvas/fetch/fetchJson";
import {IQueryParams} from "@ueu/ueu-canvas/canvasUtils";
import {apiGetConfig} from "@ueu/ueu-canvas/fetch/apiGetConfig";

const baseUrl = 'https://api.citeas.org/product'

export default async function getReferencesForText(text:string, userEmail:string, queryParams?:IQueryParams) {
    queryParams ??= {};
    queryParams.email = userEmail;
    const result = await fetchJson(baseUrl, apiGetConfig(queryParams))
    return result;
}