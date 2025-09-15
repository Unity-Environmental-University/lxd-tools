import React, { useState } from 'react';
import { Alert, Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { useEffectAsync } from '@/ui/utils';
import { Course } from '@canvas/course/Course';
import { IUserData } from '@canvas/canvasDataDefs';
import { fetchJson } from '@/canvas/fetch/fetchJson';
import "./changelog.scss";

// BRO NOTE: This interface is probably overkill to start with!
// Greg - you could literally just use {description: string, timestamp: Date} first
export interface ChangeRecord {
    id: string;
    courseId: number;
    timestamp: Date;
    userId: number;
    userName: string;
    changeType: 'page_update' | 'assignment_create' | 'assignment_update' | 'module_update' | 'quiz_update';
    pageName: string;
    pageUrl: string;
    description: string;
    // BRO CONFESSION: I added this thinking it would be cool, but it's probably complexity you don't need yet
    // beforeData?: any;
    // afterData?: any;
}

function ChangeLogApp() {
    const [course, setCourse] = useState<Course>();
    const [user, setUser] = useState<IUserData>();
    const [changes, setChanges] = useState<ChangeRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // BRO NOTE: This is the actual useful pattern - how to get Canvas course data
    useEffectAsync(async () => {
        const tempCourse = await Course.getFromUrl();
        if (tempCourse) {
            setCourse(tempCourse);
        }
    }, []);

    // Standard pattern for getting current user
    useEffectAsync(async () => {
        const user = await fetchJson('/api/v1/users/self') as IUserData;
        setUser(user);
    }, []);

    // BRO GOLDEN RETRIEVER MOMENT: I'm doing a whole fancy storage system here
    // Greg - you could literally just do: const changes = JSON.parse(localStorage.getItem('changes') || '[]')
    useEffectAsync(async () => {
        if (course) {
            setIsLoading(true);
            // Start simple: chrome.storage.local.get(['changes']).then(result => setChanges(result.changes || []))

            // This is fake data to show the UI working
            setChanges([
                {
                    id: '1',
                    courseId: course.id,
                    timestamp: new Date(),
                    userId: user?.id || 0,
                    userName: user?.name || 'Unknown',
                    changeType: 'page_update',
                    pageName: 'Week 1 Overview',
                    pageUrl: `/courses/${course.id}/pages/week-1-overview`,
                    description: 'Updated learning objectives'
                }
            ]);
            setIsLoading(false);
        }
    }, [course, user]);

    return (
        <div className="changelog-app">
            <Card className="mb-4">
                <Card.Header>
                    <h3>📋 Course Change Log</h3>
                    <small className="text-muted">
                        Track changes made to this course for designers and support staff
                    </small>
                </Card.Header>
                <Card.Body>
                    {!course && (
                        <Alert variant="info">Loading course information...</Alert>
                    )}

                    {course && (
                        <Row className="mb-3">
                            <Col>
                                <strong>Course:</strong> {course.name} ({course.courseCode})
                            </Col>
                            <Col className="text-end">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => {
                                        // TODO: Greg - Implement manual refresh
                                        console.log('Refresh changes clicked');
                                    }}
                                >
                                    🔄 Refresh Changes
                                </Button>
                            </Col>
                        </Row>
                    )}

                    {isLoading && (
                        <Alert variant="info">Loading changes...</Alert>
                    )}

                    {changes.length === 0 && !isLoading && (
                        <Alert variant="warning">
                            No changes recorded yet. Changes will appear here once the change detection system is active.
                        </Alert>
                    )}

                    {changes.map(change => (
                        <ChangeLogEntry key={change.id} change={change} />
                    ))}
                </Card.Body>
            </Card>
        </div>
    );
}

// TODO: Greg - Component to display individual change records
function ChangeLogEntry({ change }: { change: ChangeRecord }) {
    const getChangeTypeBadge = (type: ChangeRecord['changeType']) => {
        const variants = {
            'page_update': 'primary',
            'assignment_create': 'success',
            'assignment_update': 'warning',
            'module_update': 'info',
            'quiz_update': 'secondary'
        };
        return <Badge bg={variants[type]}>{type.replace('_', ' ')}</Badge>;
    };

    return (
        <Card className="mb-2 changelog-entry">
            <Card.Body>
                <Row>
                    <Col md={8}>
                        <div className="d-flex align-items-center mb-2">
                            {getChangeTypeBadge(change.changeType)}
                            <span className="ms-2 fw-bold">{change.pageName}</span>
                        </div>
                        <div className="text-muted small mb-1">
                            {change.description}
                        </div>
                        <div className="text-muted small">
                            By {change.userName} on {change.timestamp.toLocaleDateString()} at {change.timestamp.toLocaleTimeString()}
                        </div>
                    </Col>
                    <Col md={4} className="text-end">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                                // TODO: Greg - Navigate to the changed page
                                window.open(change.pageUrl, '_blank');
                            }}
                        >
                            View Page →
                        </Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

export default ChangeLogApp;