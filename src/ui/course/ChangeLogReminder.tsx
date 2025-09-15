import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import ReactDOM from "react-dom/client";
import './changeLogReminder.scss'

//Break out local storage and state into separate variables
const editedLocalStorage = localStorage.getItem('showChangeLogReminder') === 'true';
const hiddenLocalStorage = localStorage.getItem('hideChangeLogReminder') === 'true';

//Events API

export function ChangeLogReminder() {
    const [courseEdited, setCourseEdited] = React.useState<boolean>(editedLocalStorage);
    const [popupHidden, setPopupHidden] = React.useState<boolean>(hiddenLocalStorage);

    //Switch this for something more reliable(API call for POST)
    const onEditPage = /edit/.test(document.URL);

    if(onEditPage && !courseEdited) {
        localStorage.setItem('showChangeLogReminder', 'true');
        setCourseEdited(true);
    }

    const handleClose = () => {
        localStorage.removeItem('showChangeLogReminder');
        setCourseEdited(false);
        if(popupHidden) {
            setPopupHidden(false);
            localStorage.removeItem('hideChangeLogReminder');
        }
    }
    const handleShow = () => setCourseEdited(true);

    const handleHide = () => {
        localStorage.setItem('hideChangeLogReminder', 'true');
        setPopupHidden(true);
    }
    const handleUnhide = () => {
        setPopupHidden(false);
        localStorage.removeItem('hideChangeLogReminder');
    }

    if(courseEdited && !popupHidden) {
        handleShow();
    }

    return <>
            <Modal
                //Need to figure out what courseEdited is never changing
                show= {courseEdited && !popupHidden}
                dialogClassName="modal-bottom-right"
                backdrop={false}
                autoFocus={false}
                restoreFocus={false}
                enforceFocus={false}
                scrollable={true}
                keyboard={false}
            >
                <Modal.Header>
                    <Modal.Title>Commit to Change Log</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        This is a reminder to record your changes in the change log.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" className="modal-button changes-button" onClick={handleClose}>
                        Changes Logged
                    </Button>
                    <Button variant="secondary" className="modal-button hide-button" onClick={handleHide}>
                        Hide
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={courseEdited && popupHidden}>
                <Button variant="secondary" className="modal-button hide-button" onClick={handleUnhide}>!</Button>
            </Modal>
        </>
}

export async function addChangeLogReminder() {
    const container = document.createElement('div');
    container.id = 'change-log-reminder-root';
    document.body.append(container);
    const root = ReactDOM.createRoot(container);
    root.render(<ChangeLogReminder/>);
}