import {IAssignmentData, IDiscussionData, IQuizData, IPageData} from "../../src/canvas/canvasDataDefs";


export const dummyPageData :IPageData = {
    page_id: 0,
    url: 'http://localhost',
    title: 'X',
    body: '<div></div>',
}


//front docs
export const dummyQuizData: IQuizData = {
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

export const dummyAssignmentData:IAssignmentData = {
    id: 0, name: "", rubric: []
}

export const dummyDiscussionData:IDiscussionData = {
    html_url: "", id: 0, last_reply_at: "", message: "", posted_at: "", require_initial_post: false, title: "",
    delayed_post_at: ""

}