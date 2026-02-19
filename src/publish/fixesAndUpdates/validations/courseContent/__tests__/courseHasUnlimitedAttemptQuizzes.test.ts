
import { testResult } from "@publish/fixesAndUpdates/validations/utils";
import QuizKind from "@ueu/ueu-canvas/content/quizzes/QuizKind";
import {mockAsyncGen} from "@/__mocks__/utils";
import {
    courseHasUnlimitedAttemptQuizzes
} from "@publish/fixesAndUpdates/validations/courseContent/courseHasUnlimitedAttemptQuizzes";

jest.mock("@canvas/content/quizzes/QuizKind", () => ({
    dataGenerator: jest.fn()
}));

jest.mock("@publish/fixesAndUpdates/validations/utils", () => ({
    testResult: jest.fn()
}));

describe.skip("run function", () => {
    it("should return failure when quizzes have unlimited attempts", async () => {
        const mockQuizzes = [
            { title: "Quiz 1", allowed_attempts: 0, html_url: "http://example.com/quiz1" },
            { title: "Quiz 2", allowed_attempts: null, html_url: "http://example.com/quiz2" },
            { title: "Quiz 3", allowed_attempts: 3,   html_url: "http://example.com/quiz3" },
            { title: "Quiz 4", allowed_attempts: 3, show_correct_answers: true, html_url: "http://example.com/quiz2" }
        ];
        (QuizKind.dataGenerator as jest.Mock).mockReturnValueOnce(mockAsyncGen(mockQuizzes));

        await courseHasUnlimitedAttemptQuizzes.run({ id: 1, name: "Test Course" });

        expect(testResult).toHaveBeenCalledWith(false, {
            failureMessage: [
                { bodyLines: ["Quiz 1 - Test Course"], links: ["http://example.com/quiz1"] },
                { bodyLines: ["Quiz 2 - Test Course"], links: ["http://example.com/quiz2"] },
                { bodyLines: ["Quiz 3 - Test Course"], links: ["http://example.com/quiz3"] }
            ],
            userData: mockQuizzes.slice(0, 3)
        });
    });
});
