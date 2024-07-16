//const HOMETILE_WIDTH = 500;
import {ICanvasCallConfig} from "../canvasUtils";
import {ILatePolicyData, IModuleData} from "../canvasDataDefs";
import {Assignment} from "@/canvas/content/Assignment";

import {ICourseData, ICourseSettings} from "@/canvas/courseTypes";
import {Quiz} from "@/canvas/content/Quiz";
import {Page} from "@/canvas/content/Page";
import {Discussion} from "@/canvas/content/Discussion";

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
    baseCode: string | null,
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


export type GetCoursesFromAccountOptions = {
  with_enrollments?: boolean;
  enrollment_type?: ('teacher' | 'student' | 'ta' | 'observer' | 'designer')[];
  published?: boolean;
  completed?: boolean;
  blueprint?: boolean;
  blueprint_associated?: boolean;
  public?: boolean;
  by_teachers?: number[];
  by_subaccounts?: number[];
  hide_enrollmentless_courses?: boolean;
  state?: ('created' | 'claimed' | 'available' | 'completed' | 'deleted' | 'all')[];
  enrollment_term_id?: number;
  search_term?: string;
  include?: (
    | 'syllabus_body'
    | 'term'
    | 'course_progress'
    | 'storage_quota_used_mb'
    | 'total_students'
    | 'teachers'
    | 'account_name'
    | 'concluded'
  )[];
  sort?: 'course_name' | 'sis_course_id' | 'teacher' | 'account_name';
  order?: 'asc' | 'desc';
  search_by?: 'course' | 'teacher';
  starts_before?: string; // Date formatted as yyyy-mm-dd or ISO 8601 YYYY-MM-DDTHH:MM:SSZ
  ends_after?: string; // Date formatted as yyyy-mm-dd or ISO 8601 YYYY-MM-DDTHH:MM:SSZ
  homeroom?: boolean;
};

export type GetCourseOptions = {
    enrollment_type?: 'teacher' | 'student' | 'ta' | 'observer' | 'designer';
    enrollment_role?: string; // Deprecated
    enrollment_role_id?: number;
    enrollment_state?: 'active' | 'invited_or_pending' | 'completed';
    exclude_blueprint_courses?: boolean;
    include?: (
        | 'needs_grading_count'
        | 'syllabus_body'
        | 'public_description'
        | 'total_scores'
        | 'current_grading_period_scores'
        | 'grading_periods'
        | 'term'
        | 'account'
        | 'course_progress'
        | 'sections'
        | 'storage_quota_used_mb'
        | 'total_students'
        | 'passback_status'
        | 'favorites'
        | 'teachers'
        | 'observed_users'
        | 'tabs'
        | 'course_image'
        | 'banner_image'
        | 'concluded'
        )[];
    state?: ('unpublished' | 'available' | 'completed' | 'deleted')[];
};
