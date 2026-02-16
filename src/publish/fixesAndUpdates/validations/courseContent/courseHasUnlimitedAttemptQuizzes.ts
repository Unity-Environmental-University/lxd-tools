import {CourseValidation, RunTestFunction} from "@publish/fixesAndUpdates/validations/types";
import QuizKind from "@ueu/ueu-canvas";
import { IQuizData } from "@ueu/ueu-canvas/dist/content/quizzes/types";
import {testResult} from "@publish/fixesAndUpdates/validations/utils";

type _Course = { id: number, name: string }
const run: RunTestFunction<_Course, IQuizData[]> = async (course) => {


    const quizzes = QuizKind.dataGenerator(course.id);
    const affectedQuizzes = [] as IQuizData[];
    for await (const quiz of quizzes) {
        if (!quiz.allowed_attempts || quiz.allowed_attempts <= 0 || !quiz.show_correct_answers) {
            if(quiz.points_possible) affectedQuizzes.push(quiz) //only push quizzes with scores.
        }
    }

    return testResult(affectedQuizzes.length == 0, {
        failureMessage: affectedQuizzes.map(q => ({
            bodyLines: [`${q.title} - ${course.name}`],
            links: [q.html_url],
        })),
        userData: affectedQuizzes
    })


}

export const courseHasUnlimitedAttemptQuizzes: CourseValidation<  _Course, IQuizData[]> = {
    name: "Quizzes with Unlimited Attempts or are set not to show answers",
    description: "Quizzes have unlimited attempts this may be a result of the discussion settings bug.",
    run,
}