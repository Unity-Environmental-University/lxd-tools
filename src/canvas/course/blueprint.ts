import {ICanvasCallConfig, getApiPagedData} from "../canvasUtils";
import {ICourseData} from "../canvasDataDefs";
import {Course, ICourseCodeHaver, IIdHaver} from "./index";
import {ICanvasObject} from "../baseCanvasObject";
import assert from "assert";

export interface IBlueprintCourse extends IIdHaver {
    isBlueprint(): boolean,
    getAssociatedCourses(redownload?:boolean): Promise<Course[]>
}

export function isBlueprint({blueprint}: { blueprint?: boolean | undefined }) {
    return !!blueprint;
}


export async function getAssociatedCourses(course: IBlueprintCourse) {
    const id = course.id;
    if (!course.isBlueprint()) return [];
    const url = `courses/${id}/blueprint_templates/default/associated_courses`;
    const courses = await getApiPagedData<ICourseData>(url, {queryParams: {per_page: 50}});
    return courses.map(courseData => new Course(courseData));
}

export function cachedGetAssociatedCoursesFunc(course:IBlueprintCourse) {
    let cache:Course[] | null= null;
    return async (redownload=false) => {
        if (!redownload && cache) return cache;
        cache = await getAssociatedCourses(course);
        return cache;
    }
}

export async function getTermNameFromSections(course: IBlueprintCourse) {
    const [section] = await course.getAssociatedCourses();
    if(!section) throw new Error("Cannot determine term name by sections; there are no sections.")
    const sectionTerm = await section.getTerm();
    if (!sectionTerm) throw new Error("Section does not have associated term: " + section.name);
    return sectionTerm.name;
}

export async function retireBlueprint(course:Course, termName:string, config?:ICanvasCallConfig) {
    if(!course.isBlueprint()) throw new Error("Trying to retire a blueprint that's not a blueprint")
    const isCurrentBlueprint = course.courseCode?.match('BP_');
    if(!isCurrentBlueprint) throw new Error("This blueprint is not named BP_; are you trying to retire a retired blueprint?")
    const associatedCourses = await course.getAssociatedCourses();
    if (associatedCourses.length < 1) throw new Error("Can't find associated courses")
    const newCode = `BP-${termName}_${course.baseCode}`;
    const saveData:Record<string, any> = {};
    if(!course.courseCode) throw new Error("Course does not have a code");
    saveData[Course.nameProperty] = course.name.replace(course.courseCode, newCode);
    saveData['course_code'] = newCode
    await course.saveData(saveData, config);
}

