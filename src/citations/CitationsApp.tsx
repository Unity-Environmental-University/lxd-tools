import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "@citations/state/store";
import reducer, {fetchCourseData, getError, getStatus, getWorkingCourseData} from "@citations/state/courseDataSlice";
import React, {useEffect, useState} from "react";
import {useEffectAsync} from "@/ui/utils";
import Modal from "@/ui/widgets/Modal";
import {Alert, Card, Container} from "react-bootstrap";
import getCourseIdFromUrl from "@canvas/course/getCourseIdFromUrl";

export type CitationsAppProps = {
    courseId?: number,
}
export default function CitationsApp({ courseId}:CitationsAppProps) {

    const dispatch = useDispatch<AppDispatch>();
    const [isOpen, setIsOpen] = useState(true);
    const courseData = useSelector(getWorkingCourseData);
    const loadingStatus = useSelector(getStatus);
    const error = useSelector(getError);

    useEffect(()  => {
        if (courseId && courseId != courseData?.id) {
            dispatch(fetchCourseData(courseId));
        }
    }, [dispatch, courseId]);
    return <Card>
         <Card.Title>{courseData ? courseData.name : `Status: ${loadingStatus}`}</Card.Title>
        <Card.Body>
        {error}
        {error && <Alert>{error}</Alert>}
        </Card.Body>
        <Card.Footer>
        </Card.Footer>
    </Card>

}