import "./publish.scss"
import React, {useEffect, useState} from 'react';
import {useEffectAsync} from "../ui/utils";
import {PublishInterface} from "./PublishInterface";
import {ContentUpdateInterface} from "./fixesAndUpdates/ContentUpdateInterface";
import {Course} from "../canvas/course";
import {IUserData} from "../canvas/canvasDataDefs";
import { fetchJson } from "../canvas/canvasUtils";


function PublishApp() {

    const [course, setCourse] = useState<Course|null>(null);
    const [parentCourse, setParentCourse] = useState<Course|null>(null);
    const [user, setUser] = useState<IUserData>();

    async function getCourse() {
        if (!course) {
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
        console.log(user)
        setUser(user);
    }, []);

    return(user && <div>
        <PublishInterface course={course} user={user}/>
        <ContentUpdateInterface course={course} parentCourse={parentCourse} refreshCourse={getCourse}/>
    </div>)
}


export default PublishApp

