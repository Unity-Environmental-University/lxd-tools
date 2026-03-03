import {FormEvent, useState} from "react";
import {Card, Container, Row} from "react-bootstrap";
import { ITermData } from "@ueu/ueu-canvas";
import { useCourses } from "./hooks/useCourses";
import { TermPicker } from "@/reporting/TermPicker";
import {fetchCoursesThunk} from "@/reporting/data/thunks";
import {AppDispatch, RootReportingState} from "@/reporting/data/reportingStore";
import {useDispatch, useSelector} from "react-redux";
import {useInstructorsByTerm} from "@/reporting/hooks/useInstructorsByTerm";
import {FacultyRow} from "@/reporting/FacultyRow";

export const FacultyView = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [selectableTerms, setSelectableTerms] = useState<ITermData[] | undefined>();
    const [selectedTerms, setSelectedTerms] = useState<ITermData[]>([]);

    const { status: termsStatus } = useSelector((state: RootReportingState) => state.terms);
    const { status: coursesStatus } = useSelector((state: RootReportingState) => state.courses);

    const courses = useCourses(selectableTerms);
    const accountId = useSelector((state: RootReportingState) => state.accounts.accountId);
    const onPickTerm =  (terms:ITermData[]) => setSelectableTerms(terms);


    const instructors = useInstructorsByTerm({selectedTerms: selectedTerms})

    const handleSubmit = (e:FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        console.log("SUBMIT", accountId);
        console.log(instructors.map(i => i?.id))
        setSelectedTerms(selectableTerms ?? []);
        if(!accountId || !selectableTerms || selectableTerms.length == 0) return;
        dispatch(fetchCoursesThunk({
            accountId,
            termId: selectableTerms.map(t => t.id),
        }));
    }

    return (
        <Card>
            <Card.Body>
                <Row>{coursesStatus === 'loading' && <div>
                    Loading Courses... ({courses.length}) loaded...)
                </div>}</Row>
                <Container>
                    <button onClick={handleSubmit} disabled={!selectableTerms || selectableTerms.length == 0}>Find Users</button>
                    <TermPicker onPickTerms={onPickTerm} />
                    <Row>
                        {instructors.filter(f => typeof f !== 'undefined').map(faculty => (
                            <FacultyRow userId={faculty.id} key={faculty.id} />
                        ))}
                    </Row>
                    {courses.map(course => <Row>{course.course_code}</Row>)}
                </Container>
            </Card.Body>
        </Card>
    );
};
