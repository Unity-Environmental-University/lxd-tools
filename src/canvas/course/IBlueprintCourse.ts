import {ICourseCodeHaver, IIdHaver} from "@ueu/ueu-canvas/course/courseTypes";
import {Course} from "@ueu/ueu-canvas/course/Course";

export interface IBlueprintCourse extends ICourseCodeHaver, IIdHaver {
    isBlueprint(): boolean,

    getAssociatedCourses(redownload?: boolean): Promise<Course[]>
}