import {IContentHaver} from "@canvas/course/courseTypes";
import {BaseContentItem} from "@canvas/content/BaseContentItem";
import {badContentFixFunc, badContentRunFunc} from "@publish/fixesAndUpdates/validations/utils";

export default function badContentReplaceFuncs<
    CourseType extends IContentHaver,
    ContentType extends BaseContentItem,
>(
    badTest: RegExp,
    replace: string,
    getContentFunc?: (course:CourseType) => Promise<ContentType[]>
) {

    return {
        run: badContentRunFunc<CourseType, ContentType>(badTest, getContentFunc),
        fix: badContentFixFunc<CourseType, ContentType>(badTest, replace, getContentFunc)
    }
}


