import {IQuizData} from "@/canvas/content/quizzes/types";
import {IPageData} from "@/canvas/content/pages/types";
import {IAssignmentData, IDiscussionData} from "@canvas/content/types";


export const mockPageData: IPageData = {
    created_at: "", front_page: false, updated_at: "",
    page_id: 0,
    url: 'http://localhost',
    title: 'X',
    body: '<div></div>'
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
    anonymous_grading: false,
    final_grader_id: 0,
    grader_comments_visible_to_graders: false,
    grader_count: 0,
    grader_names_visible_to_final_grader: false,
    graders_anonymous_to_graders: false,
    hide_in_gradebook: false,
    moderated_grading: false,
    omit_from_final_grade: false,
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
    allow_rating: false,
    assignment_id: 1,
    discussion_subentry_count: 0,
    discussion_type: 'threaded',
    locked: false,
    locked_for_user: false,
    only_graders_can_rate: false,
    permissions: {},
    pinned: false,
    published: false,
    read_state: 'unread',
    sort_by_grading: false,
    subscribed: false,
    topic_children: [],
    unread_count: 0,
    user_can_see_posts: false,
    user_name: "",
    html_url: "", id: 0, last_reply_at: "", message: "", posted_at: "", require_initial_post: false, title: "",
    delayed_post_at: ""

}