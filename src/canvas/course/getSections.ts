import {ICanvasCallConfig, renderAsyncGen} from "@canvas/canvasUtils";
import {GetCoursesFromAccountOptions} from "@canvas/course/courseTypes";
import {Course} from "@canvas/course/Course";
import {ICourseData} from "@canvas/courseTypes";
import {sectionDataGenerator} from "@canvas/course/blueprint";

export async function getSections(courseId: number, config?: ICanvasCallConfig<GetCoursesFromAccountOptions>) {
    return (await renderAsyncGen(sectionDataGenerator(courseId, config))).map(section => new Course(section as ICourseData));
}