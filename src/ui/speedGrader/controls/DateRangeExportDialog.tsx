import React, {useState} from "react";
import {Button, Card, Col, Modal, Row} from "react-bootstrap";
import DatePicker from "react-datepicker";
import {saveDataGenFunc} from "@/ui/speedGrader/saveDataGenFunc";
import {getRowsForSections} from "@/ui/speedGrader/getData/getRowsForSections";
import {ICourseData} from "@/canvas/courseTypes";
import {getCourseDataGenerator} from "@/canvas/course";
import {baseCourseCode} from "@/canvas/course/code";
import {renderAsyncGen} from "@canvas/canvasUtils";


export interface IDateRangeExportProps {
    course: ICourseData,
    show: boolean,
    handleShow: () => void,
    handleHide: () => void,
    onExporting: () => void,
    onFinishedExporting: () => void
}

export default function DateRangeExportDialog({
    course, show,
    handleShow, handleHide,
    onExporting, onFinishedExporting
}: IDateRangeExportProps) {

    const [exportStart, setExportStart] = useState<Date | null>(new Date());
    const [exportEnd, setExportEnd] = useState<Date | null>(new Date());
    const colWidth = 'sm-6';

    return (<Modal show={show} onHide={handleHide} onShow={handleShow}>
        <Modal.Title>Export Range of Sections</Modal.Title>
        <Modal.Body>
            <Row>
                <Col className={colWidth}>
                    <Card>
                        <Card.Title id={'startDate'}>Start Date</Card.Title>
                        <Card.Body>
                            <DatePicker ariaLabelledBy={'startDate'} selected={exportStart} onChange={(date) => setExportStart(date)}></DatePicker>
                        </Card.Body>
                    </Card>
                </Col>
                <Col className={colWidth}>
                    <Card>
                        <Card.Title id={'endDate'}>End Date</Card.Title>
                        <Card.Body>
                            <DatePicker ariaLabelledBy={'endDate'} selected={exportEnd} onChange={(date) => setExportEnd(date)}></DatePicker>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={async (e) => {
                e.stopPropagation();
                onExporting();
                handleHide();
                const by_subaccounts = course.termId? [course.termId] : [];
                let sections = await renderAsyncGen(getCourseDataGenerator( baseCourseCode(course.course_code),[
                    course.account_id, course.root_account_id
                ],undefined, {
                    queryParams: {
                        starts_before: exportEnd?.toString() ?? undefined,
                        ends_after: exportStart?.toString() ?? undefined,
                        published: true,
                        by_subaccounts,
                        with_enrollments: true,
                    }
                }));

                sections ??= [];
                sections.sort((a: ICourseData, b: ICourseData) => {
                    return new Date(b.start_at).getTime() - new Date(b.start_at).getTime();
                })
                const allSectionRows: string[] = sections ? await getRowsForSections(sections) : [];

                saveDataGenFunc()(allSectionRows,
                    `${course.baseCode}-${exportStart?.toUTCString()}-${exportEnd?.toUTCString()}.csv`);
                onFinishedExporting();
                return allSectionRows;
            }}>Export Date Range</Button>
        </Modal.Footer>
    </Modal>)
}

