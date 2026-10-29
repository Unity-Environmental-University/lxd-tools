import {Modal} from "react-bootstrap";
import React from "react";


export default function SpeedGraderModalDialog(props: {
    show: boolean,
    canClose: boolean,
    header: string,
    message: string,
    container?: React.RefObject<HTMLElement | null>
}) {
    const {show, canClose, message, header, container} = props;

    return (<>
        <Modal show={show} container={container}>
            <Modal.Header closeButton={canClose}>
                <Modal.Title>{header}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
        </Modal>
    </>)
}