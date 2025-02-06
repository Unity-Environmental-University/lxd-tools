import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootReportingState} from "@/reporting/data/reportingStore";
import {Card, Col, Row, Table} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {getInstructor} from "@/reporting/data/selectors";
import { getAccountIdFromUrl } from "ueu_canvas";
import {fetchInstructorsThunk} from "@/reporting/data/fetchInstructorsThunk";



export const FacultyView = () => {

    const dispatch = useDispatch<AppDispatch>();
    const {instructors, status: instructorStatus } = useSelector(
        (state: RootReportingState) => state.faculty
    );
    const {courses, status: courseLoadStatus } = useSelector((state:RootReportingState) => state.course);



    const [accountId, setAccountId] = useState<number | null>(getAccountIdFromUrl());

    useEffect(() => {
        if(instructorStatus == 'idle' && accountId) dispatch(fetchInstructorsThunk({
            accountId,
        }))
    }, [instructorStatus, accountId]);

    // useEffect(() => {
    //     if(courseLoadStatus == 'idle' && accountId) {
    //         dispatch(fetchCoursesThunk({accountId }))
    //     }
    // }, [courseLoadStatus]);

    return <Card>
        <Card.Body>
            <h3>{instructorStatus}</h3>
            <Table>
                {instructors
                    .map(faculty => <FacultyRow userId={faculty.id} key={faculty.id} />)}
            </Table>
            <Table>
                {courses?.map(course => <Row>{course.name}</Row>)}
            </Table>
        </Card.Body>
    </Card>
}


type FacultyRowProps = { userId: number }
export const FacultyRow = ({userId}: FacultyRowProps) => {
    const instructor = useSelector(getInstructor(userId));
    return <Row>
        <Col>{instructor.sortable_name}</Col>
        <Col>{instructor.name}</Col>
        <Col>{instructor.email}</Col>
    </Row>
}