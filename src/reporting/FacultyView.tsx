import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootReportingState} from "@/reporting/data/reportingStore";
import {Card, Col, Container, Row, Table} from "react-bootstrap";
import React, {useEffect, useMemo, useState} from "react";
import {
    createInstructorSelector,
    selectCourse,
    selectCourseLoadingStatus, selectInstructors,
    selectInstructorState
} from "@/reporting/data/selectors";
import {EnrollmentData, getAccountIdFromUrl} from "ueu_canvas";
import {fetchInstructorsThunk} from "@/reporting/data/fetchInstructorsThunk";
import {ICourseData} from "@/canvas";
import {fetchEnrollmentsThunk} from "@/reporting/data/fetchEnrollmentsThunk";
import {getEnrollmentByUserId} from "@/reporting/data/selectors/enrollmentSelectors";
import {selectCourses} from "@/reporting/data/selectors/courseSelectors";
import {fetchCourseThunk} from "@/reporting/data/fetchCourseThunk";


const sortCourseByName = (a: ICourseData, b: ICourseData) => {
    return a.name.localeCompare(b.name);
}

const sortAlgorithms: Record<string, (a: ICourseData, b: ICourseData) => number> = {
    name: sortCourseByName,
}

const filterAlgorithms: Record<string, (a: ICourseData) => boolean> = {}

export const FacultyView = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {status: instructorStatus} = useSelector(
        (state: RootReportingState) => state.instructors
    );
    const instructors = useSelector(selectInstructors);
    const {status: courseLoadStatus} = useSelector((state: RootReportingState) => state.courses);
    const [sortAlgorithm] = useState<keyof typeof filterAlgorithms | undefined>('name');
    const [filterAlgorithm] = useState<keyof typeof sortAlgorithms | undefined>();
    const accountId = getAccountIdFromUrl();
    const _courses = useSelector(selectCourses);

    const courses = useMemo(() => {
        let output = _courses;
        if(filterAlgorithm) output = output.filter(filterAlgorithms[filterAlgorithm])
        if(sortAlgorithm) output = output.sort(sortAlgorithms[sortAlgorithm]);
        return output;
    }, [_courses])


    useEffect(() => {
        if (instructorStatus == 'idle' && accountId) dispatch(fetchInstructorsThunk({
            accountId,
        }));
    }, [instructorStatus, accountId]);


    return <Card>
        <Card.Body>
            <h3>{instructorStatus}</h3>
            <Container>
                {instructors
                    .map(faculty => <FacultyRow userId={faculty.id} key={faculty.id}/>)}
            </Container>
        </Card.Body>
    </Card>
}


type FacultyRowProps = { userId: number }
export const FacultyRow = ({userId}: FacultyRowProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const instructor = useSelector(createInstructorSelector(userId));
    const enrollments = useSelector(getEnrollmentByUserId(userId));
    useEffect(()=> {
        if(typeof enrollments === 'undefined'){
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
            {enrollments?.map(enrollment => <FacEnrollmentRow enrollment={enrollment} key={enrollment.id}></FacEnrollmentRow>)}
        </Row>
    </Row>
}
type FacEnrollmentRowProps = {
    enrollment: EnrollmentData,
}
export const FacEnrollmentRow = ({enrollment}:FacEnrollmentRowProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { course_id } = enrollment;
    
    const course = useSelector(selectCourse(course_id));
    const status = useSelector(selectCourseLoadingStatus(course_id));


    useEffect(() => {
        if(typeof course === 'undefined' && status !== 'loading') {
            dispatch(fetchCourseThunk({courseId: course_id}));
        }

    }, [course_id, course, status]);

    return <>
        {course && <>
            <Col>{course.course_code}</Col><Col>{course.name}</Col>
        </>}
    </>

}