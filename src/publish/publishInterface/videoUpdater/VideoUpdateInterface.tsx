import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Modal, Alert, Spinner, Table} from 'react-bootstrap';
import {
    startBatchMigration,
    collectMigrationDetails,
    migrationFailed,
    resetKalturaState,
} from '@publish/publishInterface/videoUpdater/data/kalturaMigrationsSlice';

import {migrateAssignmentStart, migratePageStart} from '@publish/publishInterface/videoUpdater/migrationLogic';
import {KalturaAppDispatch} from "@publish/publishInterface/videoUpdater/data/store";
import {getCourseAssignmentsData} from "@/canvas-redux/courseAssignmentsSlice";
import {getCoursePagesData} from "@/canvas-redux/coursePagesSlice";
import {VideoUpdateInterfaceProps} from "@publish/publishInterface/videoUpdater/data/types";
import {KalturaMigrationDetails} from "@publish/publishInterface/videoUpdater/data/types";
import {selectKalturaStatus} from "@publish/publishInterface/videoUpdater/data/migrationSelectors";
import {useEffectAsync} from "@/ui/utils";

const VideoUpdateInterface = ({courseId}: VideoUpdateInterfaceProps) => {
    const dispatch = useDispatch<KalturaAppDispatch>();
    const [showModal, setShowModal] = useState(false);
    const courseAssignments = useSelector(getCourseAssignmentsData);
    const coursePages = useSelector(getCoursePagesData);
    const {migrations, status, error} = useSelector(selectKalturaStatus);

    useEffectAsync(async () => {
        await handleCollectMigrationDetails()
    }, [courseId, dispatch]);

    const handleCloseModal = () => {
        dispatch(resetKalturaState());
        setShowModal(false);
    };

    const handleCollectMigrationDetails = async () => {
        try {
            await dispatch(collectMigrationDetails({courseId})); // Use the adjusted thunk
        } catch (error) {
            console.error("Error collecting migration details", error);
        }
    };

    const handleBatchMigration = async () => {
        dispatch(startBatchMigration());
        let allSucceeded = true;

        for (const page of coursePages) {
            try {
                await migratePageStart(page);
            } catch (err) {
                allSucceeded = false;
                dispatch(migrationFailed({id: page.id, error: (err as Error).message}));
            }
        }

        if (allSucceeded) {
            // Logic to handle successful batch migration
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
                    {status === 'loading' && <Spinner animation="border"/>}
                    {status === 'failed' && <Alert variant="danger">Migration failed: {error}</Alert>}
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Id</th>
                            <th>Status</th>
                            <th>Error (if any)</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {migrations.map(migration => (<tr key={migration.id}>
                            <td>{migration.id}</td>
                            <td>{migration.status}</td>
                            <td>{migration.error}</td>
                        </tr>))}
                        </tbody>
                    </Table>

                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Error (if any)</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {coursePages.map((page) => {
                            const migration = migrations.find(m => m.pageId === page.id);
                            return (
                                <tr key={page.id}>
                                    <td>{page.title}</td>
                                    <td>{migration?.status || 'Pending'}</td>
                                    <td>{migration?.error || 'N/A'}</td>
                                    <td>
                                        {migration?.status !== 'successful' && (
                                            <Button onClick={() => dispatch(migratePageStart(page))}>
                                                Migrate
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {courseAssignments.map((assignment) => {
                            const migration = migrations.find(m => m.assignmentId === assignment.id);
                            return (
                                <tr key={assignment.id}>
                                    <td>{assignment.title}</td>
                                    <td>{migration?.status || 'Pending'}</td>
                                    <td>{migration?.error || 'N/A'}</td>
                                    <td>
                                        {migration?.status !== 'successful' && (
                                            <Button onClick={() => dispatch(migrateAssignmentStart(assignment))}>
                                                Migrate
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                    <Button variant="primary" onClick={handleBatchMigration} disabled={status === 'loading'}>
                        Start Batch Migration
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );

    export default VideoUpdateInterface;