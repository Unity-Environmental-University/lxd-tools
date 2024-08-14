import {fetchJson} from "@/canvas/fetch/fetchJson";
import {IFile, uploadFile} from "@/canvas/files";
import {BaseCanvasObject} from "@/canvas/baseCanvasObject";
import {CanvasData} from "@/canvas/canvasDataDefs";
import assert from "assert";
import {deepObjectMerge, formDataify, ICanvasCallConfig} from "@/canvas/canvasUtils";
import {getPagedData} from "@/canvas/fetch/getPagedDataGenerator";
import {getResizedBlob} from "@/canvas/image";
import getCourseIdFromUrl from "@/canvas/course/getCourseIdFromUrl";
import {ContentKind} from "@/canvas/content/ContentKind";
import {SAFE_MAX_BANNER_WIDTH} from "@/consts";
import {NotImplementedException} from "@/canvas/NotImplementedException";



export class BaseContentItem extends BaseCanvasObject<CanvasData> {
    static bodyProperty: string;
    static nameProperty: string = 'name';
    kind: ContentKind<any, any, any>|undefined = undefined;

    _courseId: number;

    constructor(canvasData: CanvasData, courseId: number) {
        super(canvasData);
        this._courseId = courseId;
    }

    get htmlContentUrl() {
        return `${this.contentUrlPath}`.replace('/api/v1/', '/');
    }


    static get contentUrlPart() {
        assert(this.allContentUrlTemplate, "Not a content url template");
        const urlTermMatch = /\/([\w_]+)$/.exec(this.allContentUrlTemplate);
        if (!urlTermMatch) return null;
        return urlTermMatch[1];

    }

    static async getAllInCourse<T extends BaseContentItem>(courseId: number, config: ICanvasCallConfig | null = null) {
        let url = this.getAllUrl(courseId);
        let data = await getPagedData(url, config);
        return data.map(item => new this(item, courseId)) as T[];
    }

    static clearAddedContentTags(text: string) {
        let out = text.replace(/<\/?link[^>]*>/g, '');
        out = out.replace(/<\/?script[^>]*>/g, '');
        return out;
    }

    static async getFromUrl(url: string | null = null, courseId: number | null = null) {
        if (url === null) {
            url = document.documentURI;
        }

        url = url.replace(/\.com/, '.com/api/v1')
        let data = await fetchJson(url);
        if (!courseId) {
            courseId = getCourseIdFromUrl(url)
            if (!courseId) return null;
        }
        //If this is a collection of data, we can't process it as a Canvas Object
        if (Array.isArray(data)) return null;
        assert(!Array.isArray(data));
        if (data) {
            return new this(data, courseId);
        }
        return null;
    }

    static async getById<T extends BaseContentItem>(contentId: number, courseId: number) {
        return new this(await this.getDataById<T>(contentId, courseId), courseId)
    }


    get bodyKey() {
        return this.myClass.bodyProperty;
    }

    get body() {
        if (!this.bodyKey) return null;
        return this.myClass.clearAddedContentTags(this.canvasData[this.bodyKey]);
    }

    get dueAt() {
        if (!this.canvasData.hasOwnProperty('due_at')) {
            return null;
        }
        if (!this.canvasData.due_at) return null;
        return new Date(this.canvasData.due_at);
    }

    async setDueAt(date: Date): Promise<Record<string, any>> {
        throw new NotImplementedException();
    }

    async dueAtTimeDelta(timeDelta: number) {
        if (!this.dueAt) return null;
        let result = new Date(this.dueAt);
        result.setDate(result.getDate() + timeDelta)

        return await this.setDueAt(result);
    }

    get contentUrlPath() {
        let url = (<typeof BaseContentItem>this.constructor).contentUrlTemplate;
        assert(url);
        url = url.replace('{course_id}', this.courseId.toString());
        url = url.replace('{content_id}', this.id.toString());

        return url;
    }

    get courseId() {
        return this._courseId;
    }

    async updateContent(text?: string | null, name?: string | null, config?: ICanvasCallConfig) {
        const data: Record<string, any> = {};
        const constructor = <typeof BaseContentItem>this.constructor;
        assert(constructor.bodyProperty);
        assert(constructor.nameProperty);
        const nameProp = constructor.nameProperty;
        const bodyProp = constructor.bodyProperty;
        if (text && bodyProp) {
            this.canvasData[bodyProp] = text;
            data[bodyProp] = text;
        }

        if (name && nameProp) {
            this.canvasData[nameProp] = name;
            data[nameProp] = name;
        }

        return this.saveData(data, config);
    }

    async getMeInAnotherCourse(targetCourseId: number) {
        let ContentClass = this.constructor as typeof BaseContentItem
        let targets = await ContentClass.getAllInCourse(
            targetCourseId,
            {queryParams: {search_term: this.name}}
        )
        return targets.find((target: BaseContentItem) => target.name == this.name);
    }

    getAllLinks(): string[] {
        const el = this.bodyAsElement;
        const anchors = el.querySelectorAll('a');
        const urls: string[] = [];
        for (let link of anchors) urls.push(link.href);
        return urls;

    }


    get bodyAsElement() {
        assert(this.body, "This content item has no body property")
        let el = document.createElement('div');
        el.innerHTML = this.body;
        return el;
    }

    async resizeBanner(maxWidth = SAFE_MAX_BANNER_WIDTH) {
        const bannerImg = getBannerImage(this);
        if (!bannerImg) throw new Error("No banner");
        let fileData = await getFileDataFromUrl(bannerImg.src, this.courseId)
        if (!fileData) throw new Error("File not found");
        if (bannerImg.naturalWidth < maxWidth) return; //Dont resize image unless we're shrinking it
        let resizedImageBlob = await getResizedBlob(bannerImg.src, maxWidth);
        let fileName = fileData.filename;
        let fileUploadUrl = `/api/v1/courses/${this.courseId}/files`
        assert(resizedImageBlob);
        let file = new File([resizedImageBlob], fileName)
        return await uploadFile(file, fileData.folder_id, fileUploadUrl);
    }
}

async function getFileDataFromUrl(url: string, courseId: number) {
    const match = /.*\/files\/(\d+)/.exec(url);
    if (!match) return null;
    if (match) {
        const fileId = parseInt(match[1]);
        return await getFileData(fileId, courseId);
    }
}

export function getBannerImage(overviewPage: BaseContentItem) {
    const pageBody = document.createElement('html');
    if (!overviewPage.body) throw new Error(`Content item ${overviewPage.name} has no html body`)
    pageBody.innerHTML = overviewPage.body;
    return pageBody.querySelector<HTMLImageElement>('.cbt-banner-image img');
}

async function getFileData(fileId: number, courseId: number) {
    const url = `/api/v1/courses/${courseId}/files/${fileId}`
    return await fetchJson(url) as IFile;
}

export function putContentConfig<T extends Record<string, any>>(data: T, config?: ICanvasCallConfig) {
    return deepObjectMerge(config, {
        fetchInit: {
            method: 'PUT',
            body: formDataify(data)
        }
    }, true);
}