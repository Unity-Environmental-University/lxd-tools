import {IAssignmentData, IDiscussionData, IPageData, IQuizData} from "../index";


export const mockPageData: IPageData = {
    page_id: 0,
    url: 'http://localhost',
    title: 'X',
    body: '<div></div>',
}


//front docs
export const mockQuizData: IQuizData = {
    id: 0,
    title: "",
    html_url: "",
    mobile_url: "",
    preview_url: "",
    description: "",
    quiz_type: "assignment",
    assignment_group_id: 0,
    shuffle_answers: false,
    hide_results: null,
    one_time_results: false,
    allowed_attempts: 0,
    one_question_at_a_time: false,
    question_count: 0,
    points_possible: 0,
    published: false,
    unpublishable: false,
    locked_for_user: false,
    speedgrader_url: "",
    quiz_extensions_url: "",
    all_dates: null,
    version_number: 0,
    question_types: []
}

export const mockAssignmentData: IAssignmentData = {
    allowed_extensions: [],
    assignment_group_id: 0,
    automatic_peer_reviews: false,
    course_id: 0,
    created_at: "",
    description: "",
    due_at: null,
    due_date_required: false,
    grade_group_students_individually: false,
    has_overrides: false,
    html_url: "",
    integration_data: undefined,
    intra_group_peer_reviews: false,
    lock_at: null,
    max_name_length: 0,
    peer_reviews: false,
    points_possible: 0,
    position: 0,
    submission_types: [],
    submissions_download_url: "",
    unlock_at: null,
    updated_at: null,
    id: 0, name: "", rubric: []
}

export const mockDiscussionData: IDiscussionData = {
    html_url: "", id: 0, last_reply_at: "", message: "", posted_at: "", require_initial_post: false, title: "",
    delayed_post_at: ""

}