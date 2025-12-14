import {mockAsyncGen} from "@/__mocks__/utils";

import QuizKind from "@canvas/content/quizzes/QuizKind";

import {
    courseHasDoubleQuizzes,
    DoubleQuizCourse
} from "@publish/fixesAndUpdates/validations/assignments/courseHasDoubleQuizzes";
import {IQuizData} from "@canvas/content/quizzes/types";
import {mockQuizData} from "@canvas/content/__mocks__/mockContentData";



describe("courseHasDoubleQuizzes", () => {
    let course: DoubleQuizCourse;
    const exampleQuizzes: IQuizData[] = [
            {
                id: 101,
                title: "Quiz A",
                html_url: "http://example.com/",
            },
            {
                id: 102,
                title: "Quiz A",
                html_url: "http://example.com/",
            },
            {
                id: 103,
                title: "Quiz B",
                html_url: "http://example.com/",
            }
        ].map(q => ({...mockQuizData, ...q}));


    beforeEach(() => {
        jest.clearAllMocks();
        course = {
            id: 101,
            courseCode: "BP_TEST000",
            rootAccountId: 1235,
        }
    })

    it("finds courses with double quizzes", async () => {
        const quizzes = [...exampleQuizzes];
        const dgSpy = jest.spyOn(QuizKind, 'dataGenerator');
        dgSpy.mockReturnValueOnce(mockAsyncGen(quizzes));
        const result = await courseHasDoubleQuizzes.run(course);
        expect(result.success).toBe(false);
        expect(result.userData?.offenders).toEqual(expect.arrayContaining([[
            exampleQuizzes[0],
            exampleQuizzes[1],
        ]]))

    })
})