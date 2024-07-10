import {BaseCanvasObject} from "@/canvas/baseCanvasObject";
import {ICanvasCallConfig} from "@/canvas/canvasUtils";
import {Account} from "@/canvas/Account";
import assert from "assert";
import {CanvasData} from "@/canvas/canvasDataDefs";
import {getPagedData} from "@/canvas/fetch/getPagedDataGenerator";
import {fetchJson} from "@/canvas/fetch/fetchJson";

export type TermWorkflowState = 'all' | 'active' | 'deleted'

export interface ITermData extends CanvasData {
    start_at: string,
    end_at: string,
    name: string,
    workflow_state: TermWorkflowState,
    overrides?: Record<string, any>,
    course_count: number
}

export class Term extends BaseCanvasObject<ITermData> {
    static nameProperty = "name";

    static async getTerm(code: string, workflowState: 'all' | 'active' | 'deleted' = 'all', config: ICanvasCallConfig | undefined = undefined) {
        const terms = await this.searchTerms(code, workflowState, config);
        if (!Array.isArray(terms) || terms.length <= 0) {
            return null;
        }
        return terms[0];
    }

    static async getTermById(termId: number, config: ICanvasCallConfig | null = null) {
        let account = await Account.getRootAccount();
        let url = `/api/v1/accounts/${account.id}/terms/${termId}`;
        let termData = await fetchJson(url, config) as ITermData | null;
        if (termData) return new Term(termData);
        return null;
    }

    static async getAllActiveTerms(config: ICanvasCallConfig | null = null) {
        return await this.searchTerms(null, 'active', config);
    }

    static async searchTerms(
        code: string | null = null,
        workflowState: 'all' | 'active' | 'deleted' = 'all',
        config: ICanvasCallConfig | null = null) {

        config = config || {};
        config.queryParams = config.queryParams || {};

        let queryParams = config.queryParams;
        if (workflowState) queryParams['workflow_state'] = workflowState;
        if (code) queryParams['term_name'] = code;
        let rootAccount = await Account.getRootAccount();
        assert(rootAccount);
        let url = `/api/v1/accounts/${rootAccount.id}/terms`;
        const data = await getPagedData<ITermData>(url, config);
        let terms: ITermData[] = [];
        for (let datum of data) {
            if (datum.hasOwnProperty('enrollment_terms')) {
                for (let termData of datum['enrollment_terms']) {
                    terms.push(termData);
                }
            } else {
                terms.push(datum);
            }
        }
        console.log(terms);

        if (!terms || terms.length === 0) {
            return null;
        }
        return terms.map(term => new Term(term));
    }

}