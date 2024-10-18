import {useSelector} from "react-redux";
import {getWorkingCourseData} from "@/canvas-redux/courseDataSlice";
import React, {useEffect, useState} from "react";
import {Card, Col, Row} from "react-bootstrap";
import {LearningMaterial} from "@/canvas-redux/learningMaterialsSlice";

type ModuleLearningMaterialsProps = {
    lm: LearningMaterial,
}

export function LmInterface({lm}: ModuleLearningMaterialsProps) {
    const courseData = useSelector(getWorkingCourseData);
    const [links, setLinks] = useState([] as [string, string, string][]);

    useEffect(() => {

    }, [lm]);

    return <Card>
        <Card.Title>{lm.module.name}</Card.Title>
        <Card.Body>{links && links.map(([url, label, citation]) => <Row>
            <Col sm={4}>{label}</Col>
            <Col sm={4}>{url}</Col>
            <Col sm={4}>{citation}</Col>
        </Row>)}</Card.Body>
    </Card>
}