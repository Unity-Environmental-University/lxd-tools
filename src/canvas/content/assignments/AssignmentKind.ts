import {CanvasData} from "@ueu/ueu-canvas/canvasDataDefs";
import {ICanvasCallConfig} from "@ueu/ueu-canvas/canvasUtils";
import {fetchJson} from "@ueu/ueu-canvas/fetch/fetchJson";
import {getPagedDataGenerator} from "@ueu/ueu-canvas/fetch/getPagedDataGenerator";
import {ContentKind, contentUrlFuncs, putContentFunc} from "@ueu/ueu-canvas/content/ContentKind";
import {IAssignmentData, UpdateAssignmentDataOptions} from "@ueu/ueu-canvas/content/types";

export const assignmentUrlFuncs = contentUrlFuncs('assignments');
const AssignmentKind: ContentKind<
    IAssignmentData,
    CanvasData,
    UpdateAssignmentDataOptions
> = {
    getId: (data) => data.id,
    dataIsThisKind: (data): data is IAssignmentData => {
        return 'submission_types' in data
    },
    getName: (data) => data.name,
    getBody: (data) => data.description,
    async get(courseId: number, contentId: number, config?: ICanvasCallConfig<Record<string, any>>) {
        const data = await fetchJson(assignmentUrlFuncs.getApiUrl(courseId, contentId), config) as IAssignmentData;
        return data;
    },
    ...assignmentUrlFuncs,
    dataGenerator: (courseId, config) => getPagedDataGenerator<IAssignmentData>(assignmentUrlFuncs.getAllApiUrl(courseId), config),
    put: putContentFunc<UpdateAssignmentDataOptions, IAssignmentData>(assignmentUrlFuncs.getApiUrl),
}

export default AssignmentKind;