import {DateString, IAssignmentData} from "@canvas/content/types";
import {CanvasData} from "@canvas/canvasDataDefs";

type DiscussionType = 'side_comment' | 'threaded' | 'not_threaded';

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
    group_topic_children?: { id: number, group_id: number }[],
    root_topic_id?: number | null,
    podcast_url?: string,
    discussion_type: DiscussionType,
    group_category_id?: number | null,
    attachments?: FileAttachment[] | null,
    permissions: TopicPermissions,
    allow_rating: boolean,
    only_graders_can_rate: boolean,
    sort_by_grading: boolean,

}

export interface SaveDiscussionData {
    title?: string;
    message?: string;
    discussion_type?: DiscussionType;
    published?: boolean;
    delayed_post_at?: Date;
    lock_at?: Date;
    podcast_enabled?: boolean;
    podcast_has_student_posts?: boolean;
    require_initial_post?: boolean;
    assignment?: IAssignmentData;
    is_announcement?: boolean;
    pinned?: boolean;
    position_after?: string;
    group_category_id?: number;
    allow_rating?: boolean;
    only_graders_can_rate?: boolean;
    sort_by_rating?: boolean;
    specific_sections?: string;
}

export type TopicPermissions = Record<string, any>
export type FileAttachment = Record<string, any>