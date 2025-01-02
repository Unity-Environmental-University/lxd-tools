import {BaseContentItem} from "@canvas/content/BaseContentItem";
import {Course} from "@canvas/course/Course";
import {ICanvasCallConfig} from "@canvas/canvasUtils";
import {ValidationResult} from "@publish/fixesAndUpdates/validations/utils";

export type CourseValidation<
    T = Course,
    UserDataType = any,
    FixUserDataType = UserDataType
> = {
    courseCodes?: string[],
    name: string,
    description: string,
    run: (course: T, config?: ICanvasCallConfig) => Promise<ValidationResult<UserDataType>>
    fix?: (course: T, result?: ValidationResult<UserDataType>) => Promise<ValidationResult<FixUserDataType>>
}

export interface CourseFixValidation<T = Course,
    UserDataType = any,
    FixUserDataType = UserDataType
> extends CourseValidation<T, UserDataType, FixUserDataType> {
    fix: (course: T, result?: ValidationResult<UserDataType>) => Promise<ValidationResult<FixUserDataType>>
}

export type TextReplaceValidation<T, UserData = any, FixUserDataType = UserData> = {
    beforeAndAfters: [string, string][],
    positiveExemplars?: string[],
} & CourseValidation<T, UserData, FixUserDataType>


export type ContentTextReplaceFix<
    T,
    ContentType extends BaseContentItem,
    UserData = unknown
> = {
    getContent?: (course: T) => Promise<ContentType[]>,
} & TextReplaceValidation<T, UserData>