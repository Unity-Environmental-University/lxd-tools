import {Course} from "@canvas/course/Course";
import {ICanvasCallConfig} from "@canvas/canvasUtils";
import {MalformedCourseCodeError} from "@canvas/course/code";

import {NotABlueprintError} from "@canvas/course/notABlueprintError";

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