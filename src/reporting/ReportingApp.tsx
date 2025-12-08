import {Button, Card, Col, Container, Row} from "react-bootstrap";
import Modal from "@/ui/widgets/Modal";
import React, {FormEvent} from "react";
import {FacultyView} from "@/reporting/FacultyView";


export const ReportingApp = () => {

    const [show, setShow] = React.useState(false);
    const buttonText = "Reporting"
    const isDisabled = false;
    const showModal = (e:FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setShow(true);
    }
    return <>
        <Button disabled={isDisabled} role={'button'} className={"ui-button"} onClick={showModal}
        >{buttonText}</Button>
        <Modal isOpen={show} requestClose={() => setShow(false)} canClose={true}>
            <Card>
                <Container>
                <Row><Col><FacultyView/></Col></Row>
                </Container>
            </Card>
        </Modal>
    </>
}


