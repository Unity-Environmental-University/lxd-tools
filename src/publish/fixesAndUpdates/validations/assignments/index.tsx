import emptyAssignmentCategories from "@publish/fixesAndUpdates/validations/assignments/emptyAssignmentCategories";
import textSubmissionEnabled from "@publish/fixesAndUpdates/validations/assignments/textSubmissionEnabled";
import textSubEnabledBug from "@publish/fixesAndUpdates/validations/assignments/textSubEnabledBug";
import {courseHasUnusedAssignments} from "@publish/fixesAndUpdates/validations/assignments/courseHasUnusedAssignments";
import {courseHasDoubleQuizzes} from "@publish/fixesAndUpdates/validations/assignments/courseHasDoubleQuizzes";

export default [
    emptyAssignmentCategories,
    textSubmissionEnabled,
    textSubEnabledBug,
    courseHasUnusedAssignments,
    courseHasDoubleQuizzes
]
