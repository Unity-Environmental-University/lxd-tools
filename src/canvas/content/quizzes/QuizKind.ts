import {ICanvasCallConfig} from "@/canvas/canvasUtils";
import {fetchJson} from "@/canvas/fetch/fetchJson";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";

import {IQuizData} from "@/canvas/content/quizzes/types";
import {ContentKind, contentUrlFuncs, putContentFunc} from "@/canvas/content/ContentKind";

export type SaveQuizOptions = Record<string, any>
export type GetQuizOptions = Record<string, any>
export const quizUrlFuncs = contentUrlFuncs('quizzes');
const QuizKind: ContentKind<IQuizData, GetQuizOptions, SaveQuizOptions> = {
    getId: (data) => data.id,
    getName: (data) => data.title,
    dataIsThisKind: (data): data is IQuizData => 'quiz_type' in data,
    getBody: (data) => data.description,
    async get(courseId: number, contentId: number, config?: ICanvasCallConfig<Record<string, any>>) {
        const data = await fetchJson(quizUrlFuncs.getApiUrl(courseId, contentId), config) as IQuizData;
        return data;
    },
    ...quizUrlFuncs,
    dataGenerator: (courseId, config) => getPagedDataGenerator<IQuizData>(quizUrlFuncs.getAllApiUrl(courseId), config),
    put: putContentFunc<SaveQuizOptions, IQuizData>(quizUrlFuncs.getApiUrl),
}

export default QuizKind;