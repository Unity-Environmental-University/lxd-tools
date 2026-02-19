import {ICanvasCallConfig, renderAsyncGen} from "@ueu/ueu-canvas/canvasUtils";
import {GetCoursesFromAccountOptions} from "@ueu/ueu-canvas/course/courseTypes";
import {Course} from "@ueu/ueu-canvas/course/Course";
import {ICourseData} from "@ueu/ueu-canvas/courseTypes";
import {sectionDataGenerator} from "@ueu/ueu-canvas/course/blueprint";

export async function getSections(courseId: number, config?: ICanvasCallConfig<GetCoursesFromAccountOptions>) {
    return (await renderAsyncGen(sectionDataGenerator(courseId, config))).map(section => new Course(section as ICourseData));
}