import {formDataify, getItemTypeAndId, ICanvasCallConfig} from "../canvasUtils";
import {IModuleData, IModuleItemData} from "../canvasDataDefs";
import {getCourseDataGenerator, getCourseGenerator} from "./index";
import {apiWriteConfig} from "../index";
import {GetCourseOptions, GetCoursesFromAccountOptions, ICourseCodeHaver, IIdHaver} from "./courseTypes";
import {Course} from "./Course";
import {config} from "dotenv";
import {baseCourseCode, MalformedCourseCodeError} from "@/canvas/course/code";

import {ICourseData} from "@/canvas/courseTypes";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";
import {fetchGetConfig, renderAsyncGen} from "@/canvas/fetch";
import {fetchJson} from "@/canvas/fetch/fetchJson";




export interface IBlueprintCourse extends ICourseCodeHaver, IIdHaver {
    isBlueprint(): boolean,
    getAssociatedCourses(redownload?: boolean): Promise<Course[]>
}

export function isBlueprint({blueprint}: { blueprint?: boolean | undefined }) {
    return !!blueprint;
}

export function genBlueprintDataForCode(courseCode:string | null, accountIds:number[], queryParams?: GetCoursesFromAccountOptions) {
    if(!courseCode) {
        console.warn("Course code not present")
        return null;
    }
    const code = baseCourseCode(courseCode);
    if(!code) {
        console.warn(`Code ${courseCode} invalid`);
        return null;
    }

    const courseGen = getCourseDataGenerator(courseCode, accountIds, undefined, fetchGetConfig<GetCoursesFromAccountOptions>({
        blueprint: true,
        include: ['concluded'],
    }, { queryParams }))
    return courseGen;
}

export async function getSections(courseId: number, config?: ICanvasCallConfig<GetCoursesFromAccountOptions>) {
    return (await renderAsyncGen(sectionDataGenerator(courseId, config))).map(section => new Course(section));
}

export function sectionDataGenerator(courseId:number, config?: ICanvasCallConfig<GetCoursesFromAccountOptions>) {
    const url = `/api/v1/courses/${courseId}/blueprint_templates/default/associated_courses`;
    return getPagedDataGenerator<ICourseData>(url, fetchGetConfig({per_page: 50}, config));
}
export function cachedGetAssociatedCoursesFunc(course: IBlueprintCourse) {
    let cache: Course[] | null = null;
    return async (redownload = false) => {
        if (!redownload && cache) return cache;
        cache = await getSections(course.id);
        return cache;
    }
}

export async function getTermNameFromSections(sections: Course[]) {
    const [section] = sections;
    if (!section) throw new Error("Cannot determine term name by sections; there are no sections.")
    const sectionTerm = await section.getTerm();
    if (!sectionTerm) throw new Error("Section does not have associated term: " + section.name);
    return sectionTerm.name;
}

export async function retireBlueprint(course: Course, termName: string | null, config?: ICanvasCallConfig) {

    if (!course.parsedCourseCode) throw new MalformedCourseCodeError(course.courseCode);
    const isCurrentBlueprint = course.parsedCourseCode?.match('BP_');
    if (!isCurrentBlueprint) throw new NotABlueprintError("This blueprint is not named BP_; are you trying to retire a retired blueprint?")

    const newCode = `BP-${termName}_${course.baseCode}`;
    const saveData: Record<string, any> = {};

    saveData[Course.nameProperty] = course.name.replace(course.parsedCourseCode, newCode);
    saveData['course_code'] = newCode
    await course.saveData({
        course: saveData
    }, config);
}


export async function getBlueprintsFromCode(code: string, accountIds: number[], config?: ICanvasCallConfig<GetCoursesFromAccountOptions>) {
    const [_, baseCode] = code.match(/_(\w{4}\d{3})$/) || [];
    if (!baseCode) return null;
    const bps = getCourseGenerator(`BP_${baseCode}`, accountIds, undefined, config);
    return (await renderAsyncGen(bps)).toSorted((a, b) => b.name.length - a.name.length);
}

export async function lockBlueprint(courseId:number, modules: IModuleData[]) {
    let items: IModuleItemData[] = [];

    items = items.concat(...modules.map(a => (<IModuleItemData[]>[]).concat(...a.items)));
    const promises = items.map(async (item) => {
        const url = `/api/v1/courses/${courseId}/blueprint_templates/default/restrict_item`;
        let {type, id} = await getItemTypeAndId(item);
        if ( typeof id === 'undefined') return;
        let body = {
            "content_type": type,
            "content_id": id,
            "restricted": true,
            "_method": 'PUT'
        }
        await fetchJson(url, {
            fetchInit: {
                method: 'PUT',
                body: formDataify(body)
            }
        });

    });
    await Promise.all(promises);

}

export async function setAsBlueprint(courseId: number, config?: ICanvasCallConfig) {
    const url = `/api/v1/courses/${courseId}`;
    const payload = {
        course: {
            blueprint: true,
            use_blueprint_restrictions_by_object_type: 0,
            blueprint_restrictions: {
                content: 1,
                points: 1,
                due_dates: 1,
                availability_dates: 1,
            }
        }
    }
    return await fetchJson(url, apiWriteConfig('PUT', payload, config)) as ICourseData;
}


export async function unSetAsBlueprint(courseId: number, config?: ICanvasCallConfig) {
    const url = `/api/v1/courses/${courseId}`;
    const payload = {
        course: {
            blueprint: false
        }
    };
    return await fetchJson(url, apiWriteConfig("PUT", payload, config)) as ICourseData;
}


export class NotABlueprintError extends Error {
    name = "NotABlueprintError"
}