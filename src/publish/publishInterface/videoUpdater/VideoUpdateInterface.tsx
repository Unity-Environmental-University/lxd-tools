import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, Alert, Spinner } from 'react-bootstrap';
import {
    collectMigrationDetails,
    resetKalturaState,
} from '@publish/publishInterface/videoUpdater/data/kalturaMigrationsSlice';
import { KalturaAppDispatch } from "@publish/publishInterface/videoUpdater/data/store";
import { getCourseAssignmentsData } from "@/canvas-redux/courseAssignmentsSlice";
import { getCoursePagesData } from "@/canvas-redux/coursePagesSlice";
import { VideoUpdateInterfaceProps } from "@publish/publishInterface/videoUpdater/data/types";
import { selectKalturaStatus } from "@publish/publishInterface/videoUpdater/data/migrationSelectors";
import { useEffectAsync } from "@/ui/utils";
import MigrationTable from "@publish/publishInterface/videoUpdater/migrationTable/MigrationTable";
import MigrationStatusDisplay from './MigrationStatusDisplay'; // Import the StatusDisplay component

const VideoUpdateInterface = ({ courseId }: VideoUpdateInterfaceProps) => {
    const dispatch = useDispatch<KalturaAppDispatch>();
    const [showModal, setShowModal] = useState(false);
    const courseAssignments = useSelector(getCourseAssignmentsData);
    const coursePages = useSelector(getCoursePagesData);
    const { migrations, status, error } = useSelector(selectKalturaStatus);

    useEffectAsync(async () => {
        await handleCollectMigrationDetails();
    }, [courseId, dispatch]);

    const handleCloseModal = () => {
        dispatch(resetKalturaState());
        setShowModal(false);
    };

    const handleCollectMigrationDetails = async () => {
        try {
            await dispatch(collectMigrationDetails({ courseId }));
        } catch (error) {
            console.error("Error collecting migration details", error);
        }
    };

    return (
        <div>
            <Button onClick={() => setShowModal(true)}>Migrate Kaltura Content</Button>
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Kaltura Migration</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <MigrationStatusDisplay status={status} migrations={migrations} error={error}/>
                    <MigrationTable courseAssignments={courseAssignments} coursePages={coursePages} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default VideoUpdateInterface;
