import {IAssignmentData, IDiscussionData, IPageData} from "@src/canvas/canvasDataDefs";

export const dummyPageData :IPageData = {
    page_id: 0,
    url: 'http://localhost',
    title: 'X',
    body: '<div></div>',
}

export const dummyAssignmentData:IAssignmentData = {
    id: 0, name: "", rubric: []
}

export const dummyDiscussionData:IDiscussionData = {
    html_url: "", id: 0, last_reply_at: "", message: "", posted_at: "", require_initial_post: false, title: "",
    delayed_post_at: ""

}