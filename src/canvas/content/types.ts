import {CanvasData} from "@/canvas/canvasDataDefs";
import {IQueryParams} from "@/canvas/canvasUtils";
import {IAssignmentData} from "@/canvas/content/assignments/types";
import {IQuizData} from "@/canvas/content/quizzes/types";
import {IPageData} from "@/canvas/content/pages/types";
import {IDiscussionData} from "@/canvas/content/discussions/types";

export type DateString = string;

export interface AssignmentDate extends CanvasData {
    id: number,
    base?: boolean,
    title: string,
    due_at?: DateString | null,
    lock_at?: DateString | null,
    unlock_at?: DateString | null,
}

export type SubmissionType = 'discussion_topic' | 'online_quiz' | 'on_paper' | 'none' |
    'external_tool' | 'online_text_entry' | 'online_url'

export interface IGradingRules {
    drop_lowest?: number,
    drop_highest?: number,
    never_drop?: number[],
}

export type ContentData = IPageData | IAssignmentData | IQuizData | IDiscussionData

export type ContentFuncsOptions<
    GetOptionsType extends IQueryParams,
    GetAllOptionsType extends IQueryParams = GetOptionsType,
    PutDataType extends Record<string, any> = Record<string, any>
> = {

    defaultGetQuery?: GetOptionsType,
    defaultGetAllQuery?: GetAllOptionsType,

}

