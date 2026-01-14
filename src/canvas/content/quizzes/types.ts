export interface IQuizData {
    // the ID of the quiz
    "id": number
    // the title of the quiz
    "title": string,
    // the HTTP/HTTPS URL to the quiz
    "html_url": string,
    // a url suitable for loading the quiz in a mobile webview.  it will persist
    // the headless session and, for quizzes in public courses, will force the user
    // to login
    "mobile_url": string,
    // A url that can be visited in the browser with a POST request to preview a
    // quiz as the teacher. Only present when the user may grade
    "preview_url": string,
    // the description of the quiz
    "description": string,
    // type of quiz possible values: 'practice_quiz', 'assignment', 'graded_survey',
    // 'survey'
    "quiz_type": "assignment" | 'practice_quiz' | 'graded_survey' | 'survey',
    // the ID of the quiz's assignment group:
    "assignment_group_id": number,
    // quiz time limit in minutes
    "time_limit"?: number,
    // shuffle answers for students?
    "shuffle_answers": boolean,
    // let students see their quiz responses? possible values: null, 'always',
    // 'until_after_last_attempt'
    "hide_results": null | "always" | "until_after_last_attempt",
    // show which answers were correct when results are shown? only valid if
    // hide_results=null
    "show_correct_answers"?: boolean,
    // restrict the show_correct_answers option above to apply only to the last
    // submitted attempt of a quiz that allows multiple attempts. only valid if
    // show_correct_answers=true and allowed_attempts > 1
    "show_correct_answers_last_attempt"?: boolean,
    // when should the correct answers be visible by students? only valid if
    // show_correct_answers=true
    "show_correct_answers_at"?: string,
    // prevent the students from seeing correct answers after the specified date has
    // passed. only valid if show_correct_answers=true
    "hide_correct_answers_at"?: string,
    // prevent the students from seeing their results more than once (right after
    // they submit the quiz)
    "one_time_results": boolean,
    // which quiz score to keep (only if allowed_attempts != 1) possible values:
    // 'keep_highest', 'keep_latest'
    "scoring_policy"?: "keep_highest" | "keep_latest",
    // how many times a student can take the quiz -1 = unlimited attempts
    "allowed_attempts": number,
    // show one question at a time?
    "one_question_at_a_time": boolean,
    // the number of questions in the quiz
    "question_count": number,
    // The total point value given to the quiz
    "points_possible": number,
    // lock questions after answering? only valid if one_question_at_a_time=true
    "cant_go_back"?: boolean,
    // access code to restrict quiz access
    "access_code"?: string,
    // IP address or range that quiz access is limited to
    "ip_filter"?: string,
    // when the quiz is due
    "due_at"?: string,
    // when to lock the quiz
    "lock_at"?: string | null,
    // when to unlock the quiz
    "unlock_at"?: string | null,
    // whether the quiz has a published or unpublished draft state.
    "published": boolean,
    // Whether the assignment's 'published' state can be changed to false. Will be
    // false if there are student submissions for the quiz.
    "unpublishable": boolean,
    // Whether or not this is locked for the user.
    "locked_for_user": boolean,
    // (Optional) Information for the user about the lock. Present when
    // locked_for_user is true.
    // eslint-disable-next-line @/no-undef
    "lock_info"?: LockInfo | null,
    // (Optional) An explanation of why this is locked for the user. Present when
    // locked_for_user is true.
    "lock_explanation"?: string,
    // Link to Speed Grader for this quiz. Will not be present if quiz is
    // unpublished
    "speedgrader_url": string,
    // Link to endpoint to send extensions for this quiz.
    "quiz_extensions_url": string,
    // Permissions the user has for the quiz
    "permissions"?: QuizPermissions | null,
    // list of due dates for the quiz
    "all_dates": null | string[],
    // Current version number of the quiz
    "version_number": number,
    // List of question types in the quiz
    "question_types": string[],
    // Whether survey submissions will be kept anonymous (only applicable to
    // 'graded_survey', 'survey' quiz types)
    "anonymous_submissions"?: boolean
}

export type QuizPermissions = Record<string, any>
export type SaveQuizOptions = Record<string, any>
export type GetQuizOptions = Record<string, any>
