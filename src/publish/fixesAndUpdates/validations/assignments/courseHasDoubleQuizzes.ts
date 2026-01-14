
import {MessageResult, testResult} from "@publish/fixesAndUpdates/validations/utils";
import {UnusedAssignmentsCourse} from "@publish/fixesAndUpdates/validations/assignments/courseHasUnusedAssignments";
import QuizKind from "@canvas/content/quizzes/QuizKind";
import {IQuizData} from "@canvas/content/quizzes/types";
import {CourseValidation} from "@publish/fixesAndUpdates/validations/types";


export type DoubleQuizCourse = {
    id: number;
    courseCode?: string | null;
    rootAccountId: number;
};

export type DoubleQuizValidationUserData = {
    course: DoubleQuizCourse,
    offenders: IQuizData[][],
};

const run = async (course: UnusedAssignmentsCourse) => {


    const quizByName: Map<string, IQuizData[]> = new Map<string, IQuizData[]>();

    const quizGen = QuizKind.dataGenerator(course.id);
    for await (const quiz of quizGen) {
        const quizList = quizByName.get(quiz.title) ?? [];
        quizList.push(quiz);
        quizByName.set(quiz.title, quizList);
    }

    const offenders = Array.from(quizByName.values()).filter(a => a.length > 1);
    const success = offenders.length === 0;

    const failureMessage: MessageResult[] = [
        {bodyLines: [`The following quizzes were duplicated in ${course.courseCode}:`]},
        ...offenders.map(quizzes => (
            {
                bodyLines: [quizzes[0].title],
                links: quizzes.map(quiz => quiz.html_url)
            }
        ))
    ];

    return testResult(success, {
        failureMessage,
        userData: {offenders, course},
    });
};

export const courseHasDoubleQuizzes: CourseValidation<DoubleQuizCourse, DoubleQuizValidationUserData> = {
    name: "Course Has Double Quizzes",
    description: "Course has multiple quizzes with the same name",
    run,
}