// noinspection GrazieInspection

/* Very Initial refactor to JS using ChatGPT4
NOTE: Almost all of this code has had to be rewritten since then.
And starting to convert to ts
 */
/* THis has since been almost entirely rewritten. It did not do a great job at first pass.
 It kept inventing code that should work but didn't */

import assert from 'assert';

import {CanvasData, ITermData} from "./canvasDataDefs";
import {fetchJson, formDataify, getPagedData, ICanvasCallConfig} from "./canvasUtils";
import {BaseCanvasObject} from "./baseCanvasObject";
import {overrideConfig} from "../publish/fixesAndUpdates/validations/index";


/**
 *  A base class for objects that interact with the Canvas API
 */
export class Account extends BaseCanvasObject<CanvasData> {
    static nameProperty = 'name'; // The field name of the primary name of the canvas object type
    static contentUrlTemplate = '/api/v1/accounts/{content_id}'; // A templated url to get a single item
    static allContentUrlTemplate = '/api/v1/accounts'; // A templated url to get all items
    private static account: Account;

    static async getFromUrl(url: string | null = null) {
        if (url === null) {
            url = document.documentURI;
        }
        let match = /accounts\/(\d+)/.exec(url);
        if (match) {
            console.log(match);
            return await this.getAccountById(parseInt(match[1]));
        }
        return null;
    }

    static async getAccountById(accountId: number, config: ICanvasCallConfig | undefined = undefined): Promise<Account> {
        const data = await this.getDataById(accountId, null, config)
        console.assert()
        return new Account(data);
    }

    static async getRootAccount(resetCache = false) {
        let accounts: Account[] = <Account[]>await this.getAll();
        if (!resetCache && this.hasOwnProperty('account') && this.account) {
            return this.account;
        }
        let root = accounts.find((a) => a.rootAccountId === null);
        assert(root);
        this.account = root;
        return root;
    }


    get rootAccountId() {
        return this.canvasData['root_account_id']
    }

}


export class Rubric extends BaseCanvasObject<CanvasData>{
    static nameProperty = 'title';
    static contentUrlTemplate = "/api/v1/courses/{course_id}/rubrics/{content_id}";
    static allContentUrlTemplate = "/api/v1/courses/{course_id}/rubrics";

    courseId:number;

    constructor(data:CanvasData, courseId:number) {
        super(data);
        this.courseId = courseId;
    }
    async associations(reload = false) {
        if ('associations' in this.canvasData && !reload) {
            return this.canvasData['associations'];
        }

        let data = await this.myClass.getDataById(this.id, this.courseId, {queryParams: {'include': ['associations']}});
        let associations = data['associations'].map((data: CanvasData) => new RubricAssociation(data, this.courseId));
        this.canvasData['associations'] = associations;
        return associations;
    }
}


export class RubricAssociation extends BaseCanvasObject<CanvasData> {
    static contentUrlTemplate = "/api/v1/courses/{course_id}/rubric_associations/{content_id}";
    static allContentUrlTemplate = "/api/v1/courses/{course_id}/rubric_associations";
    courseId:number;

    constructor(data:CanvasData, courseId:number) {
        super(data);
        this.courseId = courseId;
    }

    get useForGrading() {
        return this.canvasData['use_for_grading'];
    }

    async setUseForGrading(value: boolean, config?:ICanvasCallConfig) {
        this.canvasData['use_for_grading'] = value;
        return await this.saveData({'rubric_association[use_for_grading]': value}, config);
    }
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

export class NotImplementedException extends Error {
}

export function apiWriteConfig(method: 'POST' | 'PUT', data: Record<string, any>, baseConfig?: ICanvasCallConfig) {
    const body = formDataify(data);
    return overrideConfig({
        fetchInit: {
            method,
            body,
        }
    }, baseConfig);
}