import {CanvasData} from "./canvasDataDefs";
import assert from "assert";
import {fetchApiJson, formDataify, getApiPagedData, ICanvasCallConfig} from "./canvasUtils";
import {BaseContentItem, Course} from "./index";


interface ICanvasObject<CanvasDataType extends CanvasData> {
    rawData: CanvasDataType,
}

export class BaseCanvasObject<CanvasDataType extends CanvasData> implements ICanvasObject<CanvasDataType>{
    static idProperty = 'id'; // The field name of the id of the canvas object type
    static nameProperty: string | null = 'name'; // The field name of the primary name of the canvas object type
    static contentUrlTemplate: string | null = null; // A templated url to get a single item
    static allContentUrlTemplate: string | null = null; // A templated url to get all items
    protected canvasData: CanvasDataType;
    protected accountId: null | number = null;

    constructor(data: CanvasDataType) {
        this.canvasData = data || {}; // A dict holding the decoded json representation of the object in Canvas
    }

    getClass(): typeof BaseContentItem {
        return this.constructor as typeof BaseContentItem;
    }


    getItem<T>(item: string) {
        return this.canvasData[item] as T;
    }


    get myClass() {
        return (<typeof BaseContentItem>this.constructor)
    }

    get nameKey() {
        assert(this.myClass.nameProperty);
        return this.myClass.nameProperty;
    }

    get rawData(): CanvasDataType {
        return {...this.canvasData};
    }

    get contentUrlPath(): null | string {
        const constructor = <typeof BaseCanvasObject>this.constructor;

        assert(typeof this.accountId === 'number');
        assert(typeof constructor.contentUrlTemplate === 'string');
        return constructor.contentUrlTemplate
            .replace('{content_id}', this.id.toString())
            .replace('{account_id}', this.accountId.toString());
    }

    get htmlContentUrl() {
        return `/${this.contentUrlPath}`;
    }

    get data() {
        return this.canvasData;
    }

    static async getDataById<T extends CanvasData = CanvasData>(contentId: number, courseId: number | null = null, config: ICanvasCallConfig | null = null): Promise<T> {
        let url = this.getUrlPathFromIds(contentId, courseId);
        const response = await fetchApiJson<T>(url, config);
        assert(!Array.isArray(response));
        return response;
    }

    static getUrlPathFromIds(
        contentId: number,
        courseId: number | null) {
        assert(typeof this.contentUrlTemplate === 'string');
        let url = this.contentUrlTemplate
            .replace('{content_id}', contentId.toString());

        if (courseId) url = url.replace('{course_id}', courseId.toString());

        return url;
    }

    /**
     *
     * @param courseId - The course ID to get elements within, if applicable
     * @param accountId - The account ID to get elements within, if applicable
     */
    static getAllUrl(courseId: number | null = null, accountId: number | null = null) {
        assert(typeof this.allContentUrlTemplate === 'string');
        let replaced = this.allContentUrlTemplate;

        if (courseId) replaced = replaced.replace('{course_id}', courseId.toString());
        if (accountId) replaced = replaced.replace('{account_id}', accountId.toString());
        return replaced;
    }

    static async getAll(config: ICanvasCallConfig | null = null) {
        let url = this.getAllUrl();
        let data = await getApiPagedData(url, config);
        return data.map(item => new this(item));
    }


    get id(): number {
        const id = this.canvasData[(<typeof BaseCanvasObject>this.constructor).idProperty];
        return parseInt(id);
    }

    get name() {
        let nameProperty = this.getClass().nameProperty;
        if (!nameProperty) return 'NAME PROPERTY NOT SET'
        return this.getItem<string>(nameProperty);
    }

    async saveData(data: Record<string, any>) {
        assert(this.contentUrlPath);
        return await fetchApiJson(this.contentUrlPath, {
            fetchInit: {
                method: 'PUT',
                body: formDataify(data)
            }
        });

    }


}