import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootReportingState} from "@/reporting/data/reportingStore";
import {Card, Col, Row, Table} from "react-bootstrap";
import React, {useEffect, useMemo, useState} from "react";
import {createInstructorSelector, getEnrollmentByUserId} from "@/reporting/data/selectors";
import {getAccountIdFromUrl} from "ueu_canvas";
import {fetchInstructorsThunk} from "@/reporting/data/fetchInstructorsThunk";
import {selectCourses} from "./data/coursesSlice";
import {ICourseData} from "@/canvas";
import {selectInstructors} from "@/reporting/data/instructorsSlice";
import {fetchEnrollmentsThunk} from "@/reporting/data/fetchEnrollmentsThunk";


const sortCourseByName = (a: ICourseData, b: ICourseData) => {
    return a.name.localeCompare(b.name);
}

const sortAlgorithms: Record<string, (a: ICourseData, b: ICourseData) => number> = {
    name: (a, b) => a.name.localeCompare(b.name),
}


const filterAlgorithms: Record<string, (a: ICourseData) => boolean> = {}

export const FacultyView = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {status: instructorStatus} = useSelector(
        (state: RootReportingState) => state.faculty
    );
    const instructors = useSelector(selectInstructors);
    const {status: courseLoadStatus} = useSelector((state: RootReportingState) => state.course);
    const [sortAlgorithm, setSortAlgorithm] = useState<keyof typeof sortAlgorithms>('name');
    const [filterAlgorithm, setFilterAlgorithm] = useState<string>("");
    const [accountId, setAccountId] = useState<number | null>(getAccountIdFromUrl());


    const courses = useMemo(() =>
            useSelector(selectCourses).sort(sortAlgorithms[sortAlgorithm])
        , [selectCourses])


    useEffect(() => {
        if (instructorStatus == 'idle' && accountId) dispatch(fetchInstructorsThunk({
            accountId,
        }))
    }, [instructorStatus, accountId]);


    return <Card>
        <Card.Body>
            <h3>{instructorStatus}</h3>
            <Table>
                {instructors
                    .map(faculty => <FacultyRow userId={faculty.id} key={faculty.id}/>)}
            </Table>
            <Table>
                {courses?.map(course => <Row>{course.name}</Row>)}
            </Table>
        </Card.Body>
    </Card>
}


type FacultyRowProps = { userId: number }
export const FacultyRow = ({userId}: FacultyRowProps) => {
    const instructor = useSelector(createInstructorSelector(userId));
    const enrollments = useSelector(getEnrollmentByUserId(userId));
    useEffect(()=> {
        if(typeof enrollments === 'undefined'){
            fetchEnrollmentsThunk({
                userId,
                queryParams: {},
            })
        }
    }, [enrollments])

    return <Row>
        <Col>{instructor.sortable_name}</Col>
        <Col>{instructor.name}</Col>
        <Col>{instructor.email}</Col>
        <Col>
        {enrollments?.map(enrollment => <Row>
            <Col>{enrollment.course_id}</Col>
            <Col>{enrollment.start_at}</Col>
        </Row>)}
        </Col>
    </Row>
}