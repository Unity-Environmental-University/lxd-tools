import {BaseCanvasObject} from "@/canvas/baseCanvasObject";
import {CanvasData} from "@/canvas/canvasDataDefs";
import {ICanvasCallConfig} from "@/canvas/canvasUtils";
import assert from "assert";

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