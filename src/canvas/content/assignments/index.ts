import {ICanvasCallConfig} from "@/canvas/canvasUtils";
import {fetchJson} from "@/canvas/fetch/fetchJson";
import {contentUrlFuncs, putContentFunc} from "@/canvas/content/getContentFuncs";
import {ContentKind} from "@/canvas/content/types";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";
import {CanvasData} from "@/canvas/canvasDataDefs";
import {IAssignmentData, UpdateAssignmentDataOptions} from "@/canvas/content/assignments/types";


export const AssignmentUrlFuncs = contentUrlFuncs('assignments');

export const AssignmentKind:ContentKind<
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
    async get(courseId:number, contentId: number, config?:ICanvasCallConfig<Record<string, any>>) {
        const data = await fetchJson(this.getApiUrl(courseId, contentId), config) as IAssignmentData;
        return data;
    },
    ...AssignmentUrlFuncs,
    dataGenerator: (courseId, config) => getPagedDataGenerator<IAssignmentData>(AssignmentUrlFuncs.getAllApiUrl(courseId), config),
    put: putContentFunc<UpdateAssignmentDataOptions, IAssignmentData>(AssignmentUrlFuncs.getApiUrl),
}

export const assignmentDataGen = AssignmentKind.dataGenerator;
export const updateAssignmentData = AssignmentKind.put!;
export const getAssignmentData = AssignmentKind.get;


