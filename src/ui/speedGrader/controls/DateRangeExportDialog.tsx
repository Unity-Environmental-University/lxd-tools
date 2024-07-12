import React, {useState} from "react";
import {Button, Card, Col, Modal, Row} from "react-bootstrap";
import DatePicker from "react-datepicker";
import {Course} from "@/canvas/course/Course";
import {saveDataGenFunc} from "@/ui/speedGrader/saveDataGenFunc";
import {getRowsForSections} from "@/ui/speedGrader/getData/getRowsForSections";
import {getSections} from "@/canvas/course/blueprint";

interface IDateRangeExportProps {
    course: Course,
    show: boolean,
    handleShow: () => void,
    handleHide: () => void,
    onExporting: () => void,
    onFinishedExporting: () => void
}

export function DateRangeExportDialog({
    course, show,
    handleShow, handleHide,
    onExporting, onFinishedExporting
}: IDateRangeExportProps) {

    const [exportStart, setExportStart] = useState<Date | null>(new Date());
    const [exportEnd, setExportEnd] = useState<Date | null>(new Date);
    const colWidth = 'sm-6';

    return (<Modal show={show} onHide={handleHide} onShow={handleShow}>
        <Modal.Title>Export Range of Sections</Modal.Title>
        <Modal.Body>
            <Row>
                <Col className={colWidth}>
                    <Card>
                        <Card.Title>Start Date</Card.Title>
                        <Card.Body>
                            <DatePicker selected={exportStart} onChange={(date) => setExportStart(date)}></DatePicker>
                        </Card.Body>
                    </Card>
                </Col>
                <Col className={colWidth}>
                    <Card>
                        <Card.Title>End Date</Card.Title>
                        <Card.Body>
                            <DatePicker selected={exportEnd} onChange={(date) => setExportEnd(date)}></DatePicker>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={async (e) => {
                e.stopPropagation();
                console.log("Exporting courses...")
                onExporting();
                handleHide();
                const by_subaccounts = course.termId? [course.termId] : [];
                let sections = await getSections(course, {
                    queryParams: {
                        starts_before: exportEnd?.toString() ?? undefined,
                        ends_after: exportStart?.toString() ?? undefined,
                        published: true,
                        by_subaccounts,
                        with_enrollments: true,
                    }
                });

                sections ??= [];
                sections.sort((a: Course, b: Course) => {
                    return b.start.getTime() - a.start.getTime();
                })
                const allSectionRows: string[] = sections ? await getRowsForSections(sections) : [];

                console.log("Writing Final Output Document...")
                saveDataGenFunc()(allSectionRows,
                    `${course.baseCode}-${exportStart?.toUTCString()}-${exportEnd?.toUTCString()}.csv`);
                onFinishedExporting();
                return allSectionRows;
            }}>Export Date Range</Button>
        </Modal.Footer>
    </Modal>)
}

