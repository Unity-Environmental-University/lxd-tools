import {ICourseCodeHaver, IIdHaver} from "@canvas/course/courseTypes";
import {Course} from "@canvas/course/Course";

export interface IBlueprintCourse extends ICourseCodeHaver, IIdHaver {
    isBlueprint(): boolean,

    getAssociatedCourses(redownload?: boolean): Promise<Course[]>
}