import {
    fetchApiJson,
    fetchJson,
    fetchOneKnownApiJson,
    formDataify,
    getItemTypeAndId,
    getPagedDataGenerator,
    ICanvasCallConfig
} from "../canvasUtils";
import {ICourseData, IModuleData, IModuleItemData} from "../canvasDataDefs";
import {Course, getCourseGenerator} from "./index";
import {apiWriteConfig} from "../index";
import {ICourseCodeHaver, IIdHaver} from "./courseTypes";

export interface IBlueprintCourse extends ICourseCodeHaver, IIdHaver {
    isBlueprint(): boolean,
    getAssociatedCourses(redownload?: boolean): Promise<Course[]>
}

export function isBlueprint({blueprint}: { blueprint?: boolean | undefined }) {
    return !!blueprint;
}


export async function getSections(course: IBlueprintCourse) {
    const id = course.id;
    if (!course.isBlueprint()) return [];
    const url = `/api/v1/courses/${id}/blueprint_templates/default/associated_courses`;
    const courseDataGenerator = getPagedDataGenerator<ICourseData>(url, {queryParams: {per_page: 50}});
    const sections: Course[] = [];
    for await (let sectionData of courseDataGenerator) {
        sections.push(await Course.getCourseById(sectionData.id))
    }
    return sections;
}

export function cachedGetAssociatedCoursesFunc(course: IBlueprintCourse) {
    let cache: Course[] | null = null;
    return async (redownload = false) => {
        if (!redownload && cache) return cache;
        cache = await getSections(course);
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
    if (!course.isBlueprint()) throw new Error("Trying to retire a blueprint that's not a blueprint")

    const isCurrentBlueprint = course.parsedCourseCode?.match('BP_');
    if (!isCurrentBlueprint) throw new Error("This blueprint is not named BP_; are you trying to retire a retired blueprint?")

    const associatedCourses = await course.getAssociatedCourses();
    if (associatedCourses.length < 1) throw new Error("Can't find associated courses")

    const newCode = `BP-${termName}_${course.baseCode}`;
    const saveData: Record<string, any> = {};
    if (!course.parsedCourseCode) throw new Error("Course does not have a code");

    saveData[Course.nameProperty] = course.name.replace(course.parsedCourseCode, newCode);
    saveData['course_code'] = newCode
    await course.saveData(saveData, config);
}

export async function makeNewBpFromDev(devCourse:Course, termName?: string) {


}


export async function getBlueprintsFromCode(code: string, accountIds: number[], config?: ICanvasCallConfig) {
    const [_, baseCode] = code.match(/_(\w{4}\d{3})$/) || [];
    if (!baseCode) return null;
    const bps = getCourseGenerator(code, accountIds, undefined, config);
    return (await renderAsyncGen(bps)).toSorted((a, b) => b.name.length - a.name.length);
}

export async function renderAsyncGen<T>(generator: AsyncGenerator<T>) {
    const out = [];
    for await (let item of generator) {
        out.push(item);
    }
    return out;
}

export async function lockBlueprint(courseId:number, modules: IModuleData[]) {
    let items: IModuleItemData[] = [];

    items = items.concat(...modules.map(a => (<IModuleItemData[]>[]).concat(...a.items)));
    const promises = items.map(async (item) => {
        const url = `/api/v1/${courseId}/blueprint_templates/default/restrict_item`;
        let {type, id} = await getItemTypeAndId(item);
        if (!id) return;
        let body = {
            "content_type": type,
            "content_id": id,
            "restricted": true,
            "_method": 'PUT'
        }
        console.log(body);
        await fetchApiJson(url, {
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


