//const HOMETILE_WIDTH = 500;
import {ICanvasCallConfig} from "../canvasUtils";
import {Assignment, Discussion, Page, Quiz} from "../content/index";
import {ICourseData, ICourseSettings, ILatePolicyData, IModuleData} from "../canvasDataDefs";

export interface IIdHaver<IdType = number> {
    id: IdType,
}

export interface ICourseDataHaver {
    rawData: ICourseData,
}

export interface ICourseCodeHaver {
    name: string,
    parsedCourseCode: string | null,
    courseCode: string | null,
    codeMatch: RegExpExecArray | null,
    baseCode: string,
}

export interface ISyllabusHaver extends IIdHaver {
    getSyllabus: (config?: ICanvasCallConfig) => Promise<string>,
    changeSyllabus: (newHtml: string, config?: ICanvasCallConfig) => any
}

export interface ICourseSettingsHaver extends IIdHaver {
    id: number,
    getSettings: (config?: ICanvasCallConfig) => Promise<ICourseSettings>
}

export interface ILatePolicyHaver extends IIdHaver {
    id: number,
    getLatePolicy: (config?: ICanvasCallConfig) => Promise<ILatePolicyData | undefined>
}

export interface IAssignmentsHaver extends IIdHaver {
    getAssignments: (config?: ICanvasCallConfig) => Promise<Assignment[]>;

}

export interface IPagesHaver extends IIdHaver {
    id: number,

    getPages(config?: ICanvasCallConfig): Promise<Page[]>
}

export interface IDiscussionsHaver extends IIdHaver {
    id: number,

    getDiscussions(config?: ICanvasCallConfig): Promise<Discussion[]>
}

export interface IQuizzesHaver extends IIdHaver {
    getQuizzes(config?: ICanvasCallConfig): Promise<Quiz[]>
}

export interface IModulesHaver extends IIdHaver {
    getModules(config?: ICanvasCallConfig): Promise<IModuleData[]>,

    getModulesByWeekNumber(config?: ICanvasCallConfig): Promise<Record<number | string, IModuleData>>
}

export interface IGradingStandardsHaver extends IIdHaver {
    getAvailableGradingStandards(config?: ICanvasCallConfig): Promise<IGradingStandardData[]>,

    getCurrentGradingStandard(config?: ICanvasCallConfig): Promise<IGradingStandardData | null>
}

export interface IGradingStandardData {
    id: number,
    title: string,
    context_type: 'Course' | 'Account',
    grading_scheme: IGradingSchemeEntry[]
}

export interface IGradingSchemeEntry {
    name: string,
    value: number
}

export interface IContentHaver extends IAssignmentsHaver, IPagesHaver, IDiscussionsHaver, ISyllabusHaver, IQuizzesHaver {
    name: string,

    getContent(config?: ICanvasCallConfig, refresh?: boolean): Promise<(Discussion | Assignment | Page | Quiz)[]>,

}

export interface IMigrationData {
    migration_type: string;
    migration_type_title: string;
    pre_attachment: { upload_params: {}; upload_url: string; message: string };
    attachment: { url: string };
    finished_at: string;
    user_id: number;
    progress_url: string;
    started_at: string;
    workflow_state: string;
    id: number;
    migration_issues_url: string
}

export interface IProgressData {
    completion: number;
    updated_at: string;
    user_id: number;
    context_type: string;
    created_at: string;
    context_id: number;
    workflow_state: string;
    id: number;
    tag: string;
    message: string;
    results: { id: string };
    url: string
}