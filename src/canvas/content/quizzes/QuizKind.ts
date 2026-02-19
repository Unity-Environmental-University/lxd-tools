import {ICanvasCallConfig} from "@ueu/ueu-canvas/canvasUtils";
import {fetchJson} from "@ueu/ueu-canvas/fetch/fetchJson";
import {getPagedDataGenerator} from "@ueu/ueu-canvas/fetch/getPagedDataGenerator";

import {GetQuizOptions, IQuizData, SaveQuizOptions} from "@ueu/ueu-canvas/content/quizzes/types";
import {ContentKind, contentUrlFuncs, putContentFunc} from "@ueu/ueu-canvas/content/ContentKind";

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