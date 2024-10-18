import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@citations/state/store";
import {fetchCourseData, getError, getStatus, getWorkingCourseData} from "@/canvas-redux/courseDataSlice";
import React, {useEffect, useState} from "react";
import {Alert, Card} from "react-bootstrap";
import {getLmsData} from "@/canvas-redux/learningMaterialsSlice";
import {LmInterface} from "@citations/LmInterface";


export type CitationsAppProps = {
    courseId?: number,
}
export default function CitationsApp({ courseId}:CitationsAppProps) {

    const dispatch = useDispatch<AppDispatch>();
    const [isOpen, setIsOpen] = useState(true);
    const courseData = useSelector(getWorkingCourseData);
    const courseLoadingStatus = useSelector(getStatus);
    const error = useSelector(getError);
    const lms = useSelector(getLmsData);
    //const modules = useSelector(getModules);

    useEffect(()  => {
        if (courseId && courseId != courseData?.id) {
            dispatch(fetchCourseData({courseId}));
        }
    }, [dispatch, courseId]);
    return <Card>
         <Card.Title>{courseData ? courseData.name : `Status: ${courseLoadingStatus}`}</Card.Title>
        <Card.Body>
        {error && <Alert>{error}</Alert>}
            {lms && lms.map(lm => <LmInterface key={lm.module.id} lm = {lm}/>)}
        </Card.Body>
        <Card.Footer>
        </Card.Footer>
    </Card>

}

