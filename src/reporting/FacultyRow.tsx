import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/reporting/data/reportingStore";
import {
    createInstructorSelector,
    getEnrollmentByUserId,
    selectCourse,
    selectCourseLoadingStatus
} from "@/reporting/data/selectors";
import React, {useEffect} from "react";
import {fetchCourseThunk} from "@/reporting/data/thunks/fetchCourseThunk";
import {Col, Row} from "react-bootstrap";
import {fetchEnrollmentsThunk} from "@/reporting/data/thunks/fetchEnrollmentsThunk";
import {EnrollmentData} from "ueu_canvas";

type FacultyRowProps = { userId: number }
export const FacultyRow = ({userId}: FacultyRowProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const instructor = useSelector(createInstructorSelector(userId));
    const enrollments = useSelector(getEnrollmentByUserId(userId));
    useEffect(() => {
        if (typeof enrollments === 'undefined') {
            dispatch(fetchEnrollmentsThunk({
                userId,
                queryParams: {},
            }))
        }
    }, [enrollments])


    return <Row>
        <Col>{instructor.sortable_name}</Col>
        <Col>{instructor.name}</Col>
        <Col>{instructor.email}</Col>
        <Row>
            {enrollments?.map(enrollment => <FacEnrollmentRow
                enrollment={enrollment}
                key={enrollment.id}
            ></FacEnrollmentRow>)}
        </Row>
    </Row>
}
type FacEnrollmentRowProps = {
    enrollment: EnrollmentData,
}
export const FacEnrollmentRow = ({enrollment}: FacEnrollmentRowProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const {course_id} = enrollment;

    const course = useSelector(selectCourse(course_id));
    const status = useSelector(selectCourseLoadingStatus(course_id));


    useEffect(() => {
        if (typeof course === 'undefined' && status !== 'loading') {
            dispatch(fetchCourseThunk({courseId: course_id}));
        }

    }, [course_id, course, status]);

    return <>
        {course && <>
            <Col>{course.course_code}</Col><Col>{course.name}</Col>
        </>}
    </>

}