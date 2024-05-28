import "react-datepicker/dist/react-datepicker.css"
import "./publish.scss"
import React, {useEffect, useState} from 'react';
import {useEffectAsync} from "../ui/utils";
import {PublishInterface} from "./publishInterface/publishInterface";
import {ContentUpdateInterface} from "./fixesAndUpdates/ContentUpdateInterface";
import {Course} from "../canvas/course/index";
import {IUserData} from "../canvas/canvasDataDefs";
import { fetchJson } from "../canvas/canvasUtils";
import {AdminApp} from "../admin/AdminApp";


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
        console.log(user)
        setUser(user);
    }, []);

    return(user && <div>
        <PublishInterface course={course} user={user}/>
        <ContentUpdateInterface course={course} parentCourse={parentCourse} refreshCourse={() => getCourse(true)}/>
        <AdminApp course={course}/>
    </div>)
}


export default PublishApp

