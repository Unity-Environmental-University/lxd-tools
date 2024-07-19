import {CanvasData} from "@/canvas/canvasDataDefs";
import {ICanvasCallConfig, IQueryParams} from "@/canvas/canvasUtils";
import {contentUrlFuncs} from "@/canvas/content/getContentFuncs";
import {IQuizData} from "@/canvas/content/Quiz";
import {IAssignmentData} from "@/canvas/content/assignments/types";

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

export interface IDiscussionData extends CanvasData {
    id: number,
    title: string,
    message: string,
    html_url: string,
    posted_at?: DateString | null | undefined,
    last_reply_at?: DateString | null | undefined,
    require_initial_post: boolean,
    discussion_subentry_count: number,
    read_state: "read" | "unread",
    unread_count: number,
    subscribed: boolean,
    subscription_hold?: 'initial_post_required' | 'not_in_group_set' | 'not_in_group' | 'topic_is_announcement',
    assignment_id: number | null,
    delayed_post_at?: string | null,
    published: boolean,
    lock_at?: DateString | null | undefined,
    locked: boolean,
    pinned: boolean,
    locked_for_user: boolean,
    lock_info?: LockInfo | null,
    user_can_see_posts: boolean,
    lock_explanation?: string | null,
    user_name: string,
    topic_children: number[],
    group_topic_children?: {id: number, group_id:number}[],
    root_topic_id?: number | null,
    podcast_url?: string,
    discussion_type: 'side_comment' | 'threaded',
    group_category_id?: number | null,
    attachments?: FileAttachment[] | null,
    permissions: TopicPermissions,
    allow_rating: boolean,
    only_graders_can_rate: boolean,
    sort_by_grading: boolean,

}

type TopicPermissions = Record<string, any>
type FileAttachment = Record<string, any>

export interface IPageData extends CanvasData {
    page_id: number,
    url: string,
    title: string,
    body?: string,
}

export type ContentData = IPageData | IAssignmentData | IQuizData | IDiscussionData


export type ContentKind<
    DataType extends ContentData,
    GetQueryOptions extends IQueryParams = Record<string, any>,
    PutDataType extends CanvasData = DataType,
    IdType = number,
> = {
    getId: (data: DataType) => IdType,
    dataIsThisKind: (data:ContentData) => data is DataType,
    getName: (data: DataType) => string,
    getBody: (data: DataType) => string | undefined,
    get: (courseId: number, contentId: number, config?: ICanvasCallConfig<GetQueryOptions>) => Promise<DataType>
    dataGenerator: (courseId: number, config?: ICanvasCallConfig<GetQueryOptions>) => AsyncGenerator<DataType>
    put: (courseId: number, contentId: number, data: PutDataType) => Promise<DataType>,
} & ReturnType<typeof contentUrlFuncs>
export type ContentFuncsOptions<
    GetOptionsType extends IQueryParams,
    GetAllOptionsType extends IQueryParams = GetOptionsType,
    PutDataType extends Record<string, any> = Record<string, any>
> = {

    defaultGetQuery?: GetOptionsType,
    defaultGetAllQuery?: GetAllOptionsType,

}

