import "./publish.scss"
import React, {useState} from 'react';
import {useEffectAsync} from "../ui/utils";
import {PublishInterface} from "./PublishInterface";
import {ContentUpdateInterface} from "./fixesAndUpdates/ContentUpdateInterface";
import {Course} from "../canvas/course";


function PublishApp() {

    const [course, setCourse] = useState<Course|null>(null);
    const [parentCourse, setParentCourse] = useState<Course|null>(null);

    async function getCourse(force:boolean = false) {
        if (!course || force) {
            const tempCourse = await Course.getFromUrl();
            if (tempCourse) {
                setCourse(tempCourse)
                setParentCourse(await tempCourse.getParentCourse())
            }
        }
    }
    useEffectAsync(getCourse, [])
    return(<div>
        <PublishInterface course={course}/>
        <ContentUpdateInterface course={course} parentCourse={parentCourse} refreshCourse={getCourse}/>
    </div>)
}


export default PublishApp

