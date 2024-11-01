import { ICanvasCallConfig } from '@/canvas/canvasUtils';
import { CanvasData } from '@/canvas/canvasDataDefs';
import {BaseCanvasObject} from "@/canvas/baseCanvasObject";

// Create a type alias for the original Account class
class MockAccount extends BaseCanvasObject<CanvasData> {
    static override nameProperty = 'name';
    static override contentUrlTemplate = '/api/v1/accounts/{content_id}';
    static override allContentUrlTemplate = '/api/v1/accounts';
    private static mockAccount: MockAccount;

    static mockAccounts: MockAccount[] = [];
    static mockDataById: Record<number, CanvasData> = {};

    static resetMocks() {
        this.mockAccounts = [];
        this.mockDataById = {};
        this.mockAccount = undefined as unknown as MockAccount;
    }

    static async getFromUrl(url: string | null = null) {
        if (url === null) {
            url = document.documentURI;
        }
        const match = /accounts\/(\d+)/.exec(url);
        if (match) {
            return await this.getAccountById(parseInt(match[1]));
        }
        return null;
    }

    static async getAccountById(accountId: number, config: ICanvasCallConfig | undefined = undefined): Promise<MockAccount> {
        const data = this.mockDataById[accountId];
        if (!data) {
            throw new Error(`No mock data found for account ID: ${accountId}`);
        }
        return new MockAccount(data);
    }

    static async getRootAccount(resetCache = false): Promise<MockAccount> {
        if (!resetCache && this.mockAccount) {
            return this.mockAccount;
        }
        const root = this.mockAccounts.find((a) => a.rootAccountId === null);
        if (!root) {
            throw new Error('No root account found in mock data');
        }
        this.mockAccount = root;
        return root;
    }

    get rootAccountId() {
        return this.canvasData['root_account_id'];
    }
}
