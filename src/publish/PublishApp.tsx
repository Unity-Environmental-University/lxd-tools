import "./publish.scss"
import React, {useEffect, useState} from 'react';
import {useEffectAsync} from "../ui/utils";

import {CourseUpdateInterface} from "./fixesAndUpdates/CourseUpdateInterface";
import {IUserData} from "../canvas/canvasDataDefs";
import {AdminApp} from "../admin/AdminApp";
import {PublishInterface} from "./publishInterface/PublishInterface";
import {Button} from "react-bootstrap";
import {Course} from "../canvas/course/Course";
import {fetchJson} from "../canvas/fetch";
import {CourseValidation} from "./fixesAndUpdates/validations";
import capstoneProjectValidations from "./fixesAndUpdates/validations/courseSpecific/capstoneProjectValidations";
import syllabusTests from "./fixesAndUpdates/validations/syllabusTests";
import courseSettingsTests from "./fixesAndUpdates/validations/courseSettings";
import courseContentTests from "./fixesAndUpdates/validations/courseContent";
import {rubricsTiedToGradesTest} from "./fixesAndUpdates/validations/rubricSettings";


function PublishApp() {

    const [course, setCourse] = useState<Course>();
    const [parentCourse, setParentCourse] = useState<Course>();
    const [user, setUser] = useState<IUserData>();

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
    useEffectAsync(async() => {
        const user = await fetchJson('/api/v1/users/self') as IUserData;
        setUser(user);
    }, []);

    const allValidations: CourseValidation[] = [
        ...capstoneProjectValidations,
        ...syllabusTests,
        ...courseSettingsTests,
        ...courseContentTests,
        //rubricsTiedToGradesTest
        //proxyServerLinkValidation,
    ]



    return(user && <div>
        <CourseUpdateInterface
            course={course}
            parentCourse={parentCourse}
            allValidations={allValidations}
            refreshCourse={() => getCourse(true)
        }/>
        <PublishInterface course={course} user={user}/>
        <AdminApp course={course}/>
    </div>)
}


export default PublishApp

