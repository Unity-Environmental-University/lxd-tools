import {Modal} from "react-bootstrap";
import React from "react";


export default function ModalDialog(props: {
    show: boolean,
    canClose: boolean,
    header: string,
    message: string
}) {
    const {show, canClose, message, header} = props;

    return (<>
        <Modal show={show}>
            <Modal.Header closeButton={canClose}>
                <Modal.Title>{header}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
        </Modal>
    </>)
}